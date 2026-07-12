-- Standalone policy for client-side archive (run this if archive RPC is not deployed)
DROP POLICY IF EXISTS "Archived: global_admin insert" ON public.archived_logs;
CREATE POLICY "Archived: global_admin insert" ON public.archived_logs
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'global_admin'));
