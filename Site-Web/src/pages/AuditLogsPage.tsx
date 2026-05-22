import { useEffect, useState, useMemo } from 'react';
import {
  ScrollText, Search, Loader2, Download, Trash2, Archive, FileArchive,
  Shield, Users, FileCode2, BookOpen, FolderTree, ServerCog, CheckSquare,
  ChevronLeft, ChevronRight, CalendarDays,
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { archiveAuditLogs, moveAuditLogsToTrash } from '@/lib/auditLogs';
import { toast } from '@/lib/toast';

interface Log {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  category: string;
  details: any;
  ip_address: string | null;
  created_at: string;
}

const CATEGORIES: { id: string; label: string; icon: any; match: (l: Log) => boolean }[] = [
  { id: 'all', label: 'Tous', icon: ScrollText, match: () => true },
  { id: 'auth', label: 'Authentification', icon: Shield, match: (l) => ['auth','login','logout','password_reset','first_password_set','force_password_reset'].includes(l.category) || ['login','logout','password_reset','first_password_set','force_password_reset'].includes(l.action) },
  { id: 'users', label: 'Utilisateurs', icon: Users, match: (l) => l.category === 'users' || l.resource === 'users' },
  { id: 'scripts', label: 'Scripts', icon: FileCode2, match: (l) => l.category === 'scripts' || l.resource === 'scripts' || l.resource === 'script' },
  { id: 'resources', label: 'Ressources', icon: BookOpen, match: (l) => l.category === 'resources' || l.resource === 'resources' || l.resource === 'resource' },
  { id: 'categories', label: 'Catégories', icon: FolderTree, match: (l) => l.category === 'categories' || l.resource === 'categories' || l.resource === 'category' },
  { id: 'system', label: 'Système', icon: ServerCog, match: (l) => l.category === 'system' },
];

const PAGE_SIZE = 15;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (error) toast.error(error.message);
    setLogs((data ?? []) as Log[]);
    setSelected(new Set());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.id === tab) ?? CATEGORIES[0];
    return logs.filter((l) => {
      if (!cat.match(l)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        l.action.toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q) ||
        (l.user_email ?? '').toLowerCase().includes(q) ||
        (l.resource_id ?? '').toLowerCase().includes(q)
      );
    });
  }, [logs, tab, search]);

  const stats = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dayMs = startOfDay.getTime();
    const auth = CATEGORIES.find((c) => c.id === 'auth')!;
    const users = CATEGORIES.find((c) => c.id === 'users')!;
    const scripts = CATEGORIES.find((c) => c.id === 'scripts')!;
    const system = CATEGORIES.find((c) => c.id === 'system')!;
    return {
      total: logs.length,
      today: logs.filter((l) => new Date(l.created_at).getTime() >= dayMs).length,
      auth: logs.filter(auth.match).length,
      users: logs.filter(users.match).length,
      scripts: logs.filter(scripts.match).length,
      system: logs.filter(system.match).length,
    };
  }, [logs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [tab, search]);
  useEffect(() => { setCurrentPage((p) => Math.min(p, totalPages)); }, [totalPages]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((l) => l.id)));
  };

  const selectedRows = useMemo(
    () => logs.filter((l) => selected.has(l.id)),
    [logs, selected],
  );

  const deleteSelected = async () => {
    if (!selectedRows.length) return;
    const r = await moveAuditLogsToTrash(selectedRows);
    if (!r.ok) { toast.error(r.error ?? 'Erreur'); return; }
    toast.success(`${selectedRows.length} log(s) déplacé(s) dans la corbeille`);
    setConfirmDelete(false);
    load();
  };

  const archiveSelected = async () => {
    if (!selectedRows.length) return;
    setArchiving(true);
    const r = await archiveAuditLogs(selectedRows);
    setArchiving(false);
    if (!r.ok) { toast.error(r.error ?? 'Erreur'); return; }
    toast.success(`${r.count ?? selectedRows.length} log(s) archivé(s) — consultables dans Archives`);
    setConfirmArchive(false);
    load();
  };

  const exportZip = async (scope: 'all' | 'filtered' | 'selected') => {
    let rows: Log[] = [];
    if (scope === 'all') rows = logs;
    else if (scope === 'filtered') rows = filtered;
    else rows = logs.filter((l) => selected.has(l.id));
    if (!rows.length) { toast.error('Aucun log à exporter'); return; }

    const zip = new JSZip();
    // Group by category
    const grouped = rows.reduce<Record<string, Log[]>>((acc, l) => {
      const k = l.category || 'system';
      (acc[k] ??= []).push(l);
      return acc;
    }, {});
    Object.entries(grouped).forEach(([cat, items]) => {
      const csv = [
        'id,created_at,category,action,resource,resource_id,user_email,ip_address,details',
        ...items.map((l) =>
          [l.id, l.created_at, l.category, l.action, l.resource, l.resource_id ?? '', l.user_email ?? '', l.ip_address ?? '', JSON.stringify(l.details ?? {})]
            .map((v) => `"${String(v).split('"').join('""')}"`).join(',')
        ),
      ].join('\n');
      zip.file(`${cat}.csv`, csv);
    });
    zip.file('manifest.json', JSON.stringify({
      generated_at: new Date().toISOString(),
      total: rows.length,
      categories: Object.fromEntries(Object.entries(grouped).map(([k, v]) => [k, v.length])),
    }, null, 2));

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `audit-logs-${new Date().toISOString().slice(0, 10)}.zip`);
    toast.success(`Archive ZIP générée (${rows.length} log${rows.length > 1 ? 's' : ''})`);
  };

  const runArchiveNow = async () => {
    if (selected.size > 0) {
      setConfirmArchive(true);
      return;
    }
    const { data, error } = await supabase.rpc('archive_old_audit_logs');
    if (error) { toast.error(error.message); return; }
    toast.success(`${data ?? 0} log(s) de plus de 90 jours archivé(s) — consultables dans Archives`);
    load();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <header className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ScrollText className="h-6 w-6 text-primary" />
                Logs & Audit
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Toutes les actions du site sont tracées. Rotation automatique vers les archives après 90 jours.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={runArchiveNow} disabled={archiving} className="gap-2">
                <Archive className="h-4 w-4" />
                {selected.size > 0 ? `Archiver (${selected.size})` : 'Archiver > 90j'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportZip('all')} className="gap-2">
                <FileArchive className="h-4 w-4" /> Export ZIP (tous)
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportZip('filtered')} className="gap-2">
                <Download className="h-4 w-4" /> Export ZIP (filtré)
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total" value={stats.total} icon={ScrollText} accent="bg-blue-500/10 text-blue-400" delay={0} />
          <StatCard label="Aujourd'hui" value={stats.today} icon={CalendarDays} accent="bg-emerald-500/10 text-emerald-400" delay={70} />
          <StatCard label="Authentification" value={stats.auth} icon={Shield} accent="bg-violet-500/10 text-violet-400" delay={140} />
          <StatCard label="Utilisateurs" value={stats.users} icon={Users} accent="bg-amber-500/10 text-amber-400" delay={210} />
          <StatCard label="Scripts" value={stats.scripts} icon={FileCode2} accent="bg-rose-500/10 text-rose-400" delay={280} />
          <StatCard label="Système" value={stats.system} icon={ServerCog} accent="bg-muted text-muted-foreground" delay={350} />
        </section>

        <div className="rounded-xl border border-border/60 bg-card p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Rechercher action, ressource, email, IP…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setCurrentPage(1); }}>
          <TabsList className="flex flex-wrap h-auto">
            {CATEGORIES.map((c) => {
              const count = c.id === 'all' ? logs.length : logs.filter(c.match).length;
              return (
                <TabsTrigger key={c.id} value={c.id} className="gap-2">
                  <c.icon className="h-3.5 w-3.5" /> {c.label}
                  <Badge variant="outline" className="ml-1">{count}</Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {CATEGORIES.map((c) => (
            <TabsContent key={c.id} value={c.id} className="mt-4">
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={toggleAll} className="gap-2">
                    <CheckSquare className="h-4 w-4" />
                    {selected.size === filtered.length && filtered.length > 0 ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </Button>
                  {selected.size > 0 && (
                    <>
                      <Badge variant="secondary">{selected.size} sélectionné(s)</Badge>
                      <Button variant="outline" size="sm" onClick={() => setConfirmArchive(true)} className="gap-2">
                        <Archive className="h-4 w-4" /> Archiver
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => exportZip('selected')} className="gap-2">
                        <FileArchive className="h-4 w-4" /> Exporter
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)} className="gap-2">
                        <Trash2 className="h-4 w-4" /> Supprimer
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12 text-sm text-muted-foreground">Aucun log dans cette catégorie</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/60 text-xs uppercase text-muted-foreground tracking-wider">
                          <th className="px-3 py-3 w-10"></th>
                          <th className="text-left px-3 py-3 font-medium">Date</th>
                          <th className="text-left px-3 py-3 font-medium">Catégorie</th>
                          <th className="text-left px-3 py-3 font-medium">Action</th>
                          <th className="text-left px-3 py-3 font-medium">Ressource</th>
                          <th className="text-left px-3 py-3 font-medium">Utilisateur</th>
                          <th className="text-left px-3 py-3 font-medium">IP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map((l) => (
                          <tr key={l.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                            <td className="px-3 py-2.5">
                              <Checkbox checked={selected.has(l.id)} onCheckedChange={() => toggle(l.id)} />
                            </td>
                            <td className="px-3 py-2.5 text-xs tabular-nums text-muted-foreground">
                              {new Date(l.created_at).toLocaleString('fr-FR')}
                            </td>
                            <td className="px-3 py-2.5">
                              <Badge variant="outline" className="text-[10px]">{l.category}</Badge>
                            </td>
                            <td className="px-3 py-2.5 font-medium text-primary">{l.action}</td>
                            <td className="px-3 py-2.5">{l.resource}{l.resource_id ? <span className="text-xs text-muted-foreground"> · {l.resource_id.slice(0, 8)}</span> : null}</td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">{l.user_email ?? '—'}</td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground tabular-nums">{l.ip_address ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {!loading && filtered.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 mt-3 animate-fade-in">
                  <p className="text-sm text-muted-foreground">
                    {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} sur{' '}
                    <span className="font-medium text-foreground">{filtered.length}</span> log{filtered.length > 1 ? 's' : ''}
                    {tab !== 'all' && (
                      <span className="ml-1">
                        · filtre <span className="font-medium text-foreground">{CATEGORIES.find((c) => c.id === tab)?.label}</span>
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                      <ChevronLeft className="h-4 w-4" /> Précédent
                    </Button>
                    <span className="text-sm text-muted-foreground px-2 tabular-nums">
                      Page <span className="font-medium text-foreground">{currentPage}</span> / {totalPages}
                    </span>
                    <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                      Suivant <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <AlertDialog open={confirmArchive} onOpenChange={setConfirmArchive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver {selected.size} log(s) ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les logs seront retirés de cette liste et déplacés vers la page Archives. Vous pourrez toujours les consulter et les exporter depuis Archives.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={archiveSelected} disabled={archiving}>
              {archiving ? 'Archivage…' : 'Archiver'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {selected.size} log(s) ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les logs seront déplacés dans la corbeille. Vous pourrez les restaurer ou les supprimer définitivement depuis la page Corbeille.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Déplacer vers la corbeille
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: any;
  accent: string;
  delay?: number;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10 blur-2xl transition group-hover:scale-125 group-hover:bg-primary/20" />
      <div className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent} mb-3 ring-1 ring-border/40 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-6" />
      </div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground tabular-nums leading-tight">{value}</p>
    </div>
  );
}
