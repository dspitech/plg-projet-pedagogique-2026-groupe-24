import { supabase } from '@/integrations/supabase/client';

export type TrashResourceType = 'script' | 'resource' | 'category' | 'log';

/**
 * Snapshot one or more rows into the trash table, then delete them from their origin table.
 * Returns { ok, error }.
 */
export async function moveToTrash(params: {
  resourceType: TrashResourceType;
  rows: Array<Record<string, any>>;
  reason?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { resourceType, rows, reason } = params;
  if (!rows.length) return { ok: true };

  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id ?? null;
  const email = userRes.user?.email ?? null;

  const snapshots = rows.map((r) => ({
    resource_type: resourceType,
    resource_id: String(r.id),
    payload: r,
    deleted_by: uid,
    deleted_by_email: email,
    reason: reason ?? null,
  }));

  const { error: trashErr } = await supabase.from('trash_items').insert(snapshots);
  if (trashErr) return { ok: false, error: trashErr.message };

  await supabase.rpc('log_audit_event', {
    _action: 'soft_delete',
    _resource: resourceType,
    _resource_id: rows.length === 1 ? String(rows[0].id) : null,
    _details: { count: rows.length, ids: rows.map((r) => r.id) },
    _category: resourceType + 's',
  });

  return { ok: true };
}

/** Restore a trash entry back into its original table. */
export async function restoreFromTrash(trashId: string): Promise<{ ok: boolean; error?: string }> {
  const { data: item, error } = await supabase
    .from('trash_items')
    .select('*')
    .eq('id', trashId)
    .maybeSingle();
  if (error || !item) return { ok: false, error: error?.message ?? 'introuvable' };

  const table =
    item.resource_type === 'script'
      ? 'scripts'
      : item.resource_type === 'resource'
        ? 'resources'
        : item.resource_type === 'category'
          ? 'categories'
          : item.resource_type === 'log'
            ? 'audit_logs'
            : null;
  if (!table) return { ok: false, error: 'type non supporté' };

  // Strip nothing — payload was a full snapshot. Use upsert to handle id collision.
  const { error: insErr } = await (supabase as any).from(table).upsert(item.payload);
  if (insErr) return { ok: false, error: insErr.message };

  await supabase.from('trash_items').delete().eq('id', trashId);

  await supabase.rpc('log_audit_event', {
    _action: 'restore',
    _resource: item.resource_type,
    _resource_id: String(item.resource_id),
    _details: {},
    _category: item.resource_type + 's',
  });
  return { ok: true };
}

export async function purgeFromTrash(ids: string[]): Promise<{ ok: boolean; error?: string }> {
  if (!ids.length) return { ok: true };
  const { error } = await supabase.from('trash_items').delete().in('id', ids);
  if (error) return { ok: false, error: error.message };
  await supabase.rpc('log_audit_event', {
    _action: 'hard_delete',
    _resource: 'trash',
    _resource_id: null,
    _details: { count: ids.length },
    _category: 'system',
  });
  return { ok: true };
}
