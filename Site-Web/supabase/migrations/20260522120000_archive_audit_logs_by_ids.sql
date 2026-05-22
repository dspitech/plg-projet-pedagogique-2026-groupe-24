-- Archive selected audit logs into archived_logs (manual archive from Logs & Audit UI)
CREATE OR REPLACE FUNCTION public.archive_audit_logs_by_ids(_ids uuid[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  moved_count INTEGER;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'global_admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF _ids IS NULL OR cardinality(_ids) = 0 THEN
    RETURN 0;
  END IF;

  WITH moved AS (
    DELETE FROM public.audit_logs
    WHERE id = ANY(_ids)
    RETURNING *
  )
  INSERT INTO public.archived_logs (
    id, user_id, user_email, action, resource, resource_id, category,
    details, ip_address, user_agent, original_created_at
  )
  SELECT
    id, user_id, user_email, action, resource, resource_id,
    COALESCE(category, 'system'), details, ip_address, user_agent, created_at
  FROM moved;

  GET DIAGNOSTICS moved_count = ROW_COUNT;
  RETURN moved_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.archive_audit_logs_by_ids(uuid[]) TO authenticated;

-- Allow global_admin to archive logs from the app (client-side fallback)
DROP POLICY IF EXISTS "Archived: global_admin insert" ON public.archived_logs;
CREATE POLICY "Archived: global_admin insert" ON public.archived_logs
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'global_admin'));
