import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ALLOWED_ORIGINS = [
  Deno.env.get("PUBLIC_APP_URL") ?? "",
  Deno.env.get("SITE_URL") ?? "",
  "http://localhost:8080",
  "http://localhost:5173",
].filter(Boolean);

const buildCors = (origin: string | null) => {
  let allow = ALLOWED_ORIGINS[0] ?? "*";
  if (origin) {
    try {
      const host = new URL(origin).hostname;
      if (ALLOWED_ORIGINS.includes(origin) || /\.lovable\.app$/.test(host)) allow = origin;
    } catch { /* ignore */ }
  }
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};

const resolveIpAddress = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim()
  ?? req.headers.get("cf-connecting-ip")
  ?? req.headers.get("x-real-ip")
  ?? null;

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (status: number, payload: unknown) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "unauthorized" });

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return json(401, { error: "unauthorized" });

    const { data: isAdmin } = await callerClient.rpc("has_role", {
      _user_id: caller.id, _role: "global_admin",
    });
    if (!isAdmin) return json(403, { error: "forbidden" });

    const { user_id } = await req.json() as { user_id?: string };
    if (!user_id || typeof user_id !== "string") return json(400, { error: "invalid_input" });
    if (user_id === caller.id) return json(400, { error: "cannot_delete_self" });

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: target } = await admin.from("profiles").select("email").eq("id", user_id).maybeSingle();

    const { error } = await admin.auth.admin.deleteUser(user_id);
    if (error) {
      console.error("admin-delete-user", error);
      return json(400, { error: "delete_failed" });
    }

    await admin.from("audit_logs").insert({
      user_id: caller.id,
      user_email: caller.email,
      action: "delete",
      resource: "users",
      resource_id: user_id,
      details: { email: target?.email ?? null },
      ip_address: resolveIpAddress(req),
      user_agent: req.headers.get("user-agent"),
    });

    return json(200, { success: true });
  } catch (err) {
    console.error("admin-delete-user", err);
    return json(500, { error: "internal_error" });
  }
});
