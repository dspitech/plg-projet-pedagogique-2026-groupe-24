-- Extend audit logging to capture request IP and user-agent.
-- Keeps existing RPC calls compatible via default NULL parameters.

DROP FUNCTION IF EXISTS public.log_audit_event(TEXT, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action TEXT,
  _resource TEXT,
  _resource_id TEXT DEFAULT NULL,
  _details JSONB DEFAULT '{}'::jsonb,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
  uid UUID;
  uemail TEXT;
  headers JSONB;
  header_ip TEXT;
  effective_ip TEXT;
  effective_user_agent TEXT;
BEGIN
  uid := auth.uid();
  SELECT email INTO uemail FROM public.profiles WHERE id = uid;

  BEGIN
    headers := NULLIF(current_setting('request.headers', true), '')::jsonb;
  EXCEPTION WHEN others THEN
    headers := NULL;
  END;

  header_ip := split_part(
    COALESCE(
      headers->>'x-forwarded-for',
      headers->>'cf-connecting-ip',
      headers->>'x-real-ip',
      ''
    ),
    ',',
    1
  );

  effective_ip := COALESCE(NULLIF(_ip_address, ''), NULLIF(btrim(header_ip), ''));
  effective_user_agent := COALESCE(NULLIF(_user_agent, ''), NULLIF(headers->>'user-agent', ''));

  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    action,
    resource,
    resource_id,
    details,
    ip_address,
    user_agent
  )
  VALUES (
    uid,
    uemail,
    _action,
    _resource,
    _resource_id,
    _details,
    effective_ip,
    effective_user_agent
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;
