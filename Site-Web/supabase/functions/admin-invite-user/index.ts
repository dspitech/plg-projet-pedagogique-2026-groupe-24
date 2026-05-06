import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_ROLES = ['global_admin', 'admin', 'editor', 'viewer'];
const FALLBACK_APP_URL = Deno.env.get('PUBLIC_APP_URL') ?? Deno.env.get('SITE_URL');
const resolveIpAddress = (req: Request) =>
  req.headers.get('x-forwarded-for')?.split(',')[0].trim()
  ?? req.headers.get('cf-connecting-ip')
  ?? req.headers.get('x-real-ip')
  ?? null;

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify caller is global_admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json(401, { error: 'Missing authorization' });
    }
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return json(401, { error: 'Unauthorized' });
    }
    const { data: isAdmin, error: roleError } = await callerClient.rpc('has_role', {
      _user_id: caller.id, _role: 'global_admin',
    });
    if (roleError) {
      return json(500, { error: roleError.message });
    }
    if (!isAdmin) {
      return json(403, { error: 'Forbidden — global_admin required' });
    }

    const body = await req.json();
    const { name, email, roles } = body as { name?: string; email?: string; roles?: string[] };
    if (!name || !email || !Array.isArray(roles) || roles.length === 0) {
      return json(400, { error: 'name, email and roles are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(400, { error: 'Invalid email' });
    }
    const validRoles = roles.filter((r) => ALLOWED_ROLES.includes(r));
    if (validRoles.length === 0) {
      return json(400, { error: 'No valid roles' });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Invite via email (sends set-password email to the frontend URL)
    const requestOrigin = req.headers.get('origin');
    const appOrigin = requestOrigin ?? FALLBACK_APP_URL;
    if (!appOrigin) {
      return json(500, { error: 'Missing app origin. Set PUBLIC_APP_URL (or SITE_URL).' });
    }
    const redirectTo = `${appOrigin.replace(/\/+$/, '')}/set-password`;
    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { name, must_change_password: true },
      redirectTo,
    });
    if (inviteError) {
      return json(400, { error: inviteError.message });
    }
    const newUserId = inviteData.user?.id;
    if (!newUserId) {
      return json(500, { error: 'User creation failed' });
    }

    // Replace default roles with chosen ones
    const { error: deleteRolesError } = await admin.from('user_roles').delete().eq('user_id', newUserId);
    if (deleteRolesError) {
      return json(500, { error: deleteRolesError.message });
    }
    const { error: insertRolesError } = await admin
      .from('user_roles')
      .insert(validRoles.map((r) => ({ user_id: newUserId, role: r })));
    if (insertRolesError) {
      return json(500, { error: insertRolesError.message });
    }

    // Ensure profile name is set
    const { error: profileError } = await admin
      .from('profiles')
      .update({ name, must_change_password: true })
      .eq('id', newUserId);
    if (profileError) {
      return json(500, { error: profileError.message });
    }

    // Audit log
    const ipAddress = resolveIpAddress(req);
    const userAgent = req.headers.get('user-agent');
    const { error: auditError } = await admin.from('audit_logs').insert({
      user_id: caller.id,
      user_email: caller.email,
      action: 'invite',
      resource: 'users',
      resource_id: newUserId,
      details: { email, roles: validRoles },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
    if (auditError) {
      return json(500, { error: auditError.message });
    }

    return json(200, { success: true, user_id: newUserId });
  } catch (err) {
    console.error(err);
    return json(500, { error: (err as Error).message });
  }
});
