import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const ALLOWED_ORIGINS = [
  Deno.env.get("PUBLIC_APP_URL") ?? "",
  Deno.env.get("SITE_URL") ?? "",
  "http://localhost:8080",
  "http://localhost:5173",
].filter(Boolean);

const buildCors = (origin: string | null) => {
  const allow =
    origin && (ALLOWED_ORIGINS.includes(origin) || /\.lovable\.app$/.test(new URL(origin).hostname))
      ? origin
      : ALLOWED_ORIGINS[0] ?? "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};

const Schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(3).max(200),
  category: z.enum(["general", "support", "partnership", "bug", "feature", "other"]),
  phone: z.string().trim().max(40).optional().nullable(),
  company: z.string().trim().max(150).optional().nullable(),
  message: z.string().trim().min(10).max(2000),
  honeypot: z.string().max(0).optional(),
});

const resolveIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
  req.headers.get("cf-connecting-ip") ??
  req.headers.get("x-real-ip") ??
  null;

const json = (status: number, body: unknown, cors: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  const cors = buildCors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" }, cors);

  try {
    const body = await req.json().catch(() => null);
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return json(400, { error: "invalid_input" }, cors);
    }
    if (parsed.data.honeypot && parsed.data.honeypot.length > 0) {
      // pretend success to avoid spammer feedback loops
      return json(200, { success: true }, cors);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const ipAddress = resolveIp(req);
    const userAgent = req.headers.get("user-agent");

    // Rate limit: max 3 submissions / 5 minutes / IP, max 20 / 24h / IP
    if (ipAddress) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
      const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

      const { count: recent } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("ip_address", ipAddress)
        .gte("created_at", fiveMinAgo);

      if ((recent ?? 0) >= 3) {
        return json(429, { error: "rate_limited", retry_after: 300 }, cors);
      }

      const { count: daily } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("ip_address", ipAddress)
        .gte("created_at", oneDayAgo);

      if ((daily ?? 0) >= 20) {
        return json(429, { error: "rate_limited", retry_after: 86400 }, cors);
      }
    }

    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      category: parsed.data.category,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      message: parsed.data.message,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      console.error("public-contact-submit insert error", error);
      return json(500, { error: "internal_error" }, cors);
    }

    return json(200, { success: true }, cors);
  } catch (err) {
    console.error("public-contact-submit", err);
    return json(500, { error: "internal_error" }, cors);
  }
});
