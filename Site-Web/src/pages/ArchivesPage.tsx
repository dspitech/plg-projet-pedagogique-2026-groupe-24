import { useEffect, useState, useMemo } from 'react';
import { Archive, Search, Loader2, Trash2, Download, FileArchive } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

interface ArchivedLog {
  id: string;
  user_email: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  category: string;
  details: any;
  ip_address: string | null;
  original_created_at: string;
  archived_at: string;
}

export default function ArchivesPage() {
  const [logs, setLogs] = useState<ArchivedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('archived_logs')
      .select('*')
      .order('original_created_at', { ascending: false })
      .limit(5000);
    if (error) toast.error(error.message);
    setLogs((data ?? []) as ArchivedLog[]);
    setSelected(new Set());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const categories = useMemo(
    () => Array.from(new Set(logs.map((l) => l.category))).sort(),
    [logs]
  );

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (category !== 'all' && l.category !== category) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        l.action.toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q) ||
        (l.user_email ?? '').toLowerCase().includes(q)
      );
    });
  }, [logs, category, search]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((l) => l.id)));
  };

  const deleteSelected = async () => {
    const ids = Array.from(selected);
    const { error } = await supabase.from('archived_logs').delete().in('id', ids);
    if (error) { toast.error(error.message); return; }
    toast.success(`${ids.length} archive(s) supprimée(s)`);
    setConfirmDelete(false);
    load();
  };

  const exportZip = async () => {
    const rows = selected.size > 0 ? filtered.filter((l) => selected.has(l.id)) : filtered;
    if (!rows.length) { toast.error('Aucune archive à exporter'); return; }
    const zip = new JSZip();
    const grouped = rows.reduce<Record<string, ArchivedLog[]>>((acc, l) => {
      (acc[l.category] ??= []).push(l);
      return acc;
    }, {});
    Object.entries(grouped).forEach(([cat, items]) => {
      const csv = [
        'id,original_created_at,archived_at,action,resource,resource_id,user_email,ip_address,details',
        ...items.map((l) => [l.id, l.original_created_at, l.archived_at, l.action, l.resource, l.resource_id ?? '', l.user_email ?? '', l.ip_address ?? '', JSON.stringify(l.details)]
          .map((v) => `"${String(v).split('"').join('""')}"`).join(',')),
      ].join('\n');
      zip.file(`${cat}.csv`, csv);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `archives-${new Date().toISOString().slice(0, 10)}.zip`);
    toast.success('Archive ZIP générée');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <header className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-info/5 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Archive className="h-6 w-6 text-info" />
                Archives
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Logs d'audit déplacés automatiquement après 90 jours. Consultation, export et purge.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={exportZip} className="gap-2">
                <FileArchive className="h-4 w-4" /> Exporter ZIP
              </Button>
              {selected.size > 0 && (
                <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Supprimer ({selected.size})
                </Button>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Total archives', value: logs.length },
            { label: 'Catégories', value: categories.length },
            { label: 'Filtrés', value: filtered.length },
            { label: 'Sélectionnés', value: selected.size },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>
            </div>
          ))}
        </section>

        <div className="rounded-xl border border-border/60 bg-card p-3 flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Aucune archive</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs uppercase text-muted-foreground tracking-wider">
                    <th className="px-3 py-3 w-10">
                      <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                    </th>
                    <th className="text-left px-3 py-3 font-medium">Date d'origine</th>
                    <th className="text-left px-3 py-3 font-medium">Archivé le</th>
                    <th className="text-left px-3 py-3 font-medium">Catégorie</th>
                    <th className="text-left px-3 py-3 font-medium">Action</th>
                    <th className="text-left px-3 py-3 font-medium">Ressource</th>
                    <th className="text-left px-3 py-3 font-medium">Utilisateur</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 1000).map((l) => (
                    <tr key={l.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                      <td className="px-3 py-2.5">
                        <Checkbox checked={selected.has(l.id)} onCheckedChange={() => toggle(l.id)} />
                      </td>
                      <td className="px-3 py-2.5 text-xs tabular-nums text-muted-foreground">{new Date(l.original_created_at).toLocaleString('fr-FR')}</td>
                      <td className="px-3 py-2.5 text-xs tabular-nums text-muted-foreground">{new Date(l.archived_at).toLocaleDateString('fr-FR')}</td>
                      <td className="px-3 py-2.5"><Badge variant="outline" className="text-[10px]">{l.category}</Badge></td>
                      <td className="px-3 py-2.5 font-medium text-primary">{l.action}</td>
                      <td className="px-3 py-2.5">{l.resource}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{l.user_email ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {selected.size} archive(s) ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
