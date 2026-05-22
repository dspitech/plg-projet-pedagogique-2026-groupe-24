import { supabase } from '@/integrations/supabase/client';
import { moveToTrash } from '@/lib/trash';

export type AuditLogRow = {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  action: string;
  resource: string;
  resource_id?: string | null;
  category: string;
  details?: unknown;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
};

function isMissingRpcError(message: string): boolean {
  return (
    message.includes('Could not find the function') ||
    message.includes('schema cache') ||
    message.includes('PGRST202')
  );
}

function toArchivedRows(rows: AuditLogRow[]) {
  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id ?? null,
    user_email: r.user_email ?? null,
    action: r.action,
    resource: r.resource,
    resource_id: r.resource_id ?? null,
    category: r.category || 'system',
    details: r.details ?? {},
    ip_address: r.ip_address ?? null,
    user_agent: r.user_agent ?? null,
    original_created_at: r.created_at,
  }));
}

/** Archive via RPC when deployed, otherwise insert + delete (requires RLS insert policy). */
async function archiveViaClient(rows: AuditLogRow[]): Promise<{ ok: boolean; count?: number; error?: string }> {
  const ids = rows.map((r) => r.id);
  const { error: insertError } = await supabase.from('archived_logs').insert(toArchivedRows(rows));
  if (insertError) return { ok: false, error: insertError.message };

  const { error: deleteError } = await supabase.from('audit_logs').delete().in('id', ids);
  if (deleteError) return { ok: false, error: deleteError.message };

  return { ok: true, count: rows.length };
}

/** Move audit logs into archived_logs (visible on Archives page). */
export async function archiveAuditLogs(rows: AuditLogRow[]): Promise<{ ok: boolean; count?: number; error?: string }> {
  if (!rows.length) return { ok: false, error: 'Aucun log à archiver' };

  const clientResult = await archiveViaClient(rows);
  if (clientResult.ok) return clientResult;

  const ids = rows.map((r) => r.id);
  const { data, error } = await supabase.rpc('archive_audit_logs_by_ids', { _ids: ids });
  if (!error) return { ok: true, count: data ?? rows.length };
  if (!isMissingRpcError(error.message)) return { ok: false, error: error.message };

  return clientResult;
}

/** Soft-delete audit logs into trash_items (visible on Corbeille page). */
export async function moveAuditLogsToTrash(rows: AuditLogRow[]): Promise<{ ok: boolean; error?: string }> {
  if (!rows.length) return { ok: false, error: 'Aucun log à supprimer' };
  const t = await moveToTrash({ resourceType: 'log', rows, reason: 'deleted_from_audit_logs' });
  if (!t.ok) return t;
  const { error } = await supabase.from('audit_logs').delete().in('id', rows.map((r) => r.id));
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
