import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ALLOWED_ROLES = ["global_admin", "admin", "editor", "viewer"];
const FALLBACK_APP_URL = Deno.env.get("PUBLIC_APP_URL") ?? Deno.env.get("SITE_URL");

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

    const { data: isAdmin, error: roleError } = await callerClient.rpc("has_role", {
      _user_id: caller.id, _role: "global_admin",
    });
    if (roleError) {
      console.error("admin-invite-user role check", roleError);
      return json(500, { error: "internal_error" });
    }
    if (!isAdmin) return json(403, { error: "forbidden" });

    const body = await req.json();
    const { name, email, roles } = body as { name?: string; email?: string; roles?: string[] };
    if (!name || !email || !Array.isArray(roles) || roles.length === 0) {
      return json(400, { error: "invalid_input" });
    }
    if (typeof name !== "string" || name.length < 2 || name.length > 100) {
      return json(400, { error: "invalid_input" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return json(400, { error: "invalid_email" });
    }
    const validRoles = roles.filter((r) => ALLOWED_ROLES.includes(r));
    if (validRoles.length === 0) return json(400, { error: "invalid_roles" });

    const admin = createClient(supabaseUrl, serviceKey);

    const requestOrigin = req.headers.get("origin");
    const appOrigin = requestOrigin ?? FALLBACK_APP_URL;
    if (!appOrigin) return json(500, { error: "missing_origin" });
    const redirectTo = `${appOrigin.replace(/\/+$/, "")}/set-password`;

    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { name, must_change_password: true },
      redirectTo,
    });
    if (inviteError) {
      console.error("admin-invite-user invite", inviteError);
      return json(400, { error: "invite_failed" });
    }
    const newUserId = inviteData.user?.id;
    if (!newUserId) return json(500, { error: "internal_error" });

    const { error: deleteRolesError } = await admin.from("user_roles").delete().eq("user_id", newUserId);
    if (deleteRolesError) {
      console.error("admin-invite-user delete roles", deleteRolesError);
      return json(500, { error: "internal_error" });
    }
    const { error: insertRolesError } = await admin
      .from("user_roles")
      .insert(validRoles.map((r) => ({ user_id: newUserId, role: r })));
    if (insertRolesError) {
      console.error("admin-invite-user insert roles", insertRolesError);
      return json(500, { error: "internal_error" });
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({ name, must_change_password: true })
      .eq("id", newUserId);
    if (profileError) {
      console.error("admin-invite-user profile", profileError);
      return json(500, { error: "internal_error" });
    }

    await admin.from("audit_logs").insert({
      user_id: caller.id,
      user_email: caller.email,
      action: "invite",
      resource: "users",
      resource_id: newUserId,
      details: { email, roles: validRoles },
      ip_address: resolveIpAddress(req),
      user_agent: req.headers.get("user-agent"),
    });

    return json(200, { success: true, user_id: newUserId });
  } catch (err) {
    console.error("admin-invite-user", err);
    return json(500, { error: "internal_error" });
  }
});
