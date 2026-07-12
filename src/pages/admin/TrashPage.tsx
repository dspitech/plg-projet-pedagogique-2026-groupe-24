import { useEffect, useState, useMemo } from 'react';
import {
  Trash2, Search, Loader2, RotateCcw, FileCode2, BookOpen, FolderTree, Filter, ShieldAlert, ScrollText,
} from 'lucide-react';
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
import { restoreFromTrash, purgeFromTrash } from '@/lib/trash';

interface TrashItem {
  id: string;
  resource_type: string;
  resource_id: string;
  payload: any;
  deleted_by_email: string | null;
  reason: string | null;
  created_at: string;
}

const ICONS: Record<string, any> = {
  script: FileCode2,
  resource: BookOpen,
  category: FolderTree,
  log: ScrollText,
};

const TYPE_LABELS: Record<string, string> = {
  script: 'Script',
  resource: 'Ressource',
  category: 'Catégorie',
  log: 'Log audit',
};

function trashItemLabel(item: TrashItem): string {
  if (item.resource_type === 'log') {
    const p = item.payload ?? {};
    const action = p.action ?? '—';
    const resource = p.resource ?? '';
    const cat = p.category ? ` · ${p.category}` : '';
    return `${action}${resource ? ` (${resource})` : ''}${cat}`;
  }
  return (item.payload?.name ?? item.resource_id.slice(0, 12)) as string;
}

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmPurge, setConfirmPurge] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('trash_items').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as TrashItem[]);
    setSelected(new Set());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (type !== 'all' && i.resource_type !== type) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      const name = (i.payload?.name ?? '').toString().toLowerCase();
      const action = (i.payload?.action ?? '').toString().toLowerCase();
      const email = (i.payload?.user_email ?? '').toString().toLowerCase();
      return (
        name.includes(q) ||
        action.includes(q) ||
        email.includes(q) ||
        i.resource_id.toLowerCase().includes(q)
      );
    });
  }, [items, type, search]);

  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((i) => i.id)));
  };

  const handleRestore = async (id: string) => {
    const r = await restoreFromTrash(id);
    if (!r.ok) { toast.error(r.error ?? 'Erreur'); return; }
    toast.success('Élément restauré');
    load();
  };
  const handleBulkRestore = async () => {
    let okCount = 0;
    for (const id of selected) {
      const r = await restoreFromTrash(id);
      if (r.ok) okCount++;
    }
    toast.success(`${okCount}/${selected.size} restauré(s)`);
    load();
  };
  const handlePurge = async () => {
    const r = await purgeFromTrash(Array.from(selected));
    if (!r.ok) { toast.error(r.error ?? 'Erreur'); return; }
    toast.success(`${selected.size} élément(s) supprimé(s) définitivement`);
    setConfirmPurge(false);
    load();
  };

  const counts = {
    all: items.length,
    script: items.filter((i) => i.resource_type === 'script').length,
    resource: items.filter((i) => i.resource_type === 'resource').length,
    category: items.filter((i) => i.resource_type === 'category').length,
    log: items.filter((i) => i.resource_type === 'log').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <header className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-destructive/5 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Trash2 className="h-6 w-6 text-destructive" />
                Corbeille
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Éléments supprimés depuis toutes les pages. Restaurez-les ou supprimez-les définitivement.
              </p>
            </div>
            {selected.size > 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkRestore} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Restaurer ({selected.size})
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setConfirmPurge(true)} className="gap-2">
                  <ShieldAlert className="h-4 w-4" /> Supprimer définitivement
                </Button>
              </div>
            )}
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          {[
            { label: 'Total', value: counts.all, tone: 'border-border/60' },
            { label: 'Scripts', value: counts.script, tone: 'border-primary/30' },
            { label: 'Ressources', value: counts.resource, tone: 'border-info/30' },
            { label: 'Catégories', value: counts.category, tone: 'border-success/30' },
            { label: 'Logs audit', value: counts.log, tone: 'border-violet-500/30' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border ${s.tone} bg-card p-4`}>
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
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px]"><Filter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="script">Scripts</SelectItem>
              <SelectItem value="resource">Ressources</SelectItem>
              <SelectItem value="category">Catégories</SelectItem>
              <SelectItem value="log">Logs audit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">La corbeille est vide</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs uppercase text-muted-foreground tracking-wider">
                    <th className="px-3 py-3 w-10">
                      <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                    </th>
                    <th className="text-left px-3 py-3 font-medium">Type</th>
                    <th className="text-left px-3 py-3 font-medium">Nom</th>
                    <th className="text-left px-3 py-3 font-medium">Supprimé par</th>
                    <th className="text-left px-3 py-3 font-medium">Date</th>
                    <th className="text-right px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => {
                    const Icon = ICONS[i.resource_type] ?? Trash2;
                    return (
                      <tr key={i.id} className="border-b border-border/40 hover:bg-secondary/20">
                        <td className="px-3 py-2.5">
                          <Checkbox checked={selected.has(i.id)} onCheckedChange={() => toggle(i.id)} />
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant="outline" className="gap-1">
                            <Icon className="h-3 w-3" />
                            {TYPE_LABELS[i.resource_type] ?? i.resource_type}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 font-medium">{trashItemLabel(i)}</td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{i.deleted_by_email ?? '—'}</td>
                        <td className="px-3 py-2.5 text-xs tabular-nums text-muted-foreground">{new Date(i.created_at).toLocaleString('fr-FR')}</td>
                        <td className="px-3 py-2.5 text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleRestore(i.id)} title="Restaurer">
                            <RotateCcw className="h-4 w-4 text-success" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => purgeFromTrash([i.id]).then(load)} title="Supprimer définitivement">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmPurge} onOpenChange={setConfirmPurge}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement {selected.size} élément(s) ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les données seront effacées de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handlePurge} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
