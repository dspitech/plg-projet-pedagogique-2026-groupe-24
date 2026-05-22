-- =========================================================
-- 1. AUDIT LOGS: add category, allow global_admin delete
-- =========================================================
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'system';

CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON public.audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

DROP POLICY IF EXISTS "Audit: global_admin delete" ON public.audit_logs;
CREATE POLICY "Audit: global_admin delete" ON public.audit_logs
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'));

-- =========================================================
-- 2. user_roles RLS fix: allow self insert (for delegation finalization)
-- =========================================================
DROP POLICY IF EXISTS "Roles: self insert" ON public.user_roles;
CREATE POLICY "Roles: self insert" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- =========================================================
-- 3. log_audit_event upgraded to accept category
-- =========================================================
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action text,
  _resource text,
  _resource_id text DEFAULT NULL,
  _details jsonb DEFAULT '{}'::jsonb,
  _ip_address text DEFAULT NULL,
  _user_agent text DEFAULT NULL,
  _category text DEFAULT NULL
)
RETURNS uuid
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
  effective_category TEXT;
BEGIN
  uid := auth.uid();
  SELECT email INTO uemail FROM public.profiles WHERE id = uid;

  BEGIN
    headers := NULLIF(current_setting('request.headers', true), '')::jsonb;
  EXCEPTION WHEN others THEN
    headers := NULL;
  END;

  header_ip := split_part(
    COALESCE(headers->>'x-forwarded-for', headers->>'cf-connecting-ip', headers->>'x-real-ip', ''),
    ',', 1
  );

  effective_ip := COALESCE(NULLIF(_ip_address, ''), NULLIF(btrim(header_ip), ''));
  effective_user_agent := COALESCE(NULLIF(_user_agent, ''), NULLIF(headers->>'user-agent', ''));
  effective_category := COALESCE(NULLIF(_category, ''), _resource, 'system');

  INSERT INTO public.audit_logs (user_id, user_email, action, resource, resource_id, details, ip_address, user_agent, category)
  VALUES (uid, uemail, _action, _resource, _resource_id, _details, effective_ip, effective_user_agent, effective_category)
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

-- =========================================================
-- 4. TRASH BIN (universal soft-delete)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.trash_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL,         -- script | resource | category | log
  resource_id TEXT NOT NULL,
  payload JSONB NOT NULL,              -- full snapshot for restore
  deleted_by UUID,
  deleted_by_email TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trash_resource ON public.trash_items(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_trash_created_at ON public.trash_items(created_at DESC);

ALTER TABLE public.trash_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trash: staff or owner read" ON public.trash_items
FOR SELECT TO authenticated
USING (
  deleted_by = auth.uid()
  OR public.has_role(auth.uid(),'global_admin')
  OR public.has_role(auth.uid(),'admin')
  OR public.has_role(auth.uid(),'editor')
);

CREATE POLICY "Trash: staff insert" ON public.trash_items
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(),'global_admin')
  OR public.has_role(auth.uid(),'admin')
  OR public.has_role(auth.uid(),'editor')
);

CREATE POLICY "Trash: staff delete" ON public.trash_items
FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(),'global_admin')
  OR public.has_role(auth.uid(),'admin')
);

-- =========================================================
-- 5. ARCHIVED LOGS (90-day rotation)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.archived_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  category TEXT NOT NULL DEFAULT 'system',
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  original_created_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_archived_logs_category ON public.archived_logs(category);
CREATE INDEX IF NOT EXISTS idx_archived_logs_original_created_at ON public.archived_logs(original_created_at DESC);

ALTER TABLE public.archived_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Archived: global_admin read" ON public.archived_logs
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'global_admin'));

CREATE POLICY "Archived: global_admin delete" ON public.archived_logs
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'global_admin'));

-- =========================================================
-- 6. Rotation function (>90 days) and cron job
-- =========================================================
CREATE OR REPLACE FUNCTION public.archive_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  moved_count INTEGER;
BEGIN
  WITH moved AS (
    DELETE FROM public.audit_logs
    WHERE created_at < now() - INTERVAL '90 days'
    RETURNING *
  )
  INSERT INTO public.archived_logs (id, user_id, user_email, action, resource, resource_id, category, details, ip_address, user_agent, original_created_at)
  SELECT id, user_id, user_email, action, resource, resource_id, COALESCE(category,'system'), details, ip_address, user_agent, created_at
  FROM moved;

  GET DIAGNOSTICS moved_count = ROW_COUNT;
  RETURN moved_count;
END;
$$;

-- Enable pg_cron if available
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily rotation at 03:00 UTC
DO $$ BEGIN
  PERFORM cron.unschedule('archive-audit-logs-daily');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'archive-audit-logs-daily',
  '0 3 * * *',
  $$ SELECT public.archive_old_audit_logs(); $$
);