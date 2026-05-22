import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCode2,
  BookOpen,
  FolderTree,
  Users,
  ScrollText,
  Archive,
  Trash2,
  Activity,
  TrendingUp,
  ShieldCheck,
  Star,
  Download,
  Loader2,
  ArrowUpRight,
  CheckCircle2,
  Globe,
  Layers,
  UserX,
  CalendarDays,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

interface Stats {
  scripts: number;
  scriptsActive: number;
  scriptsDraft: number;
  scriptsArchived: number;
  scriptsPublic: number;
  scriptsValidated: number;
  resources: number;
  resourcesActive: number;
  resourcesArchived: number;
  resourcesPublic: number;
  resourcesFeatured: number;
  categories: number;
  categoriesActive: number;
  categoriesVisible: number;
  users: number;
  usersActive: number;
  usersSuspended: number;
  logs24h: number;
  logs7d: number;
  logsToday: number;
  trash: number;
  archives: number;
  totalDownloads: number;
  byType: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
  byResourceType: { name: string; value: number }[];
  topScripts: { name: string; views: number; downloads: number }[];
  recentLogs: any[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--info))',
  'hsl(var(--destructive))',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
];

const REFRESH_DEBOUNCE_MS = 600;

export default function DashboardPage() {
  const [s, setS] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(async () => {
    const silent = hasLoaded.current;
    if (!silent) setLoading(true);

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [scripts, resources, categories, users, logs24, logs7, logsToday, trash, archives, recent] =
      await Promise.all([
        supabase
          .from('scripts')
          .select(
            'id,name,status,script_type,visibility,is_validated,views_count,downloads_count',
          ),
        supabase
          .from('resources')
          .select('id,name,visibility,resource_type,status,is_featured,views_count,downloads_count'),
        supabase.from('categories').select('id,status,is_visible'),
        supabase.from('profiles').select('id,is_active,is_suspended'),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', since24h),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', since7d),
        supabase
          .from('audit_logs')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString()),
        supabase.from('trash_items').select('id', { count: 'exact', head: true }),
        supabase.from('archived_logs').select('id', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(8),
      ]);

    const sd = scripts.data ?? [];
    const rd = resources.data ?? [];
    const cd = categories.data ?? [];
    const ud = users.data ?? [];

    const groupCount = (items: any[], key: string) =>
      Object.entries(
        items.reduce<Record<string, number>>((acc, x) => {
          const k = x[key] ?? 'unknown';
          acc[k] = (acc[k] ?? 0) + 1;
          return acc;
        }, {}),
      ).map(([name, value]) => ({ name, value }));

    setS({
      scripts: sd.length,
      scriptsActive: sd.filter((x: any) => x.status === 'active').length,
      scriptsDraft: sd.filter((x: any) => x.status === 'draft').length,
      scriptsArchived: sd.filter((x: any) => x.status === 'archived').length,
      scriptsPublic: sd.filter((x: any) => x.visibility === 'public').length,
      scriptsValidated: sd.filter((x: any) => x.is_validated).length,
      resources: rd.length,
      resourcesActive: rd.filter((x: any) => x.status === 'active').length,
      resourcesArchived: rd.filter((x: any) => x.status === 'archived').length,
      resourcesPublic: rd.filter((x: any) => x.visibility === 'public').length,
      resourcesFeatured: rd.filter((x: any) => x.is_featured).length,
      categories: cd.length,
      categoriesActive: cd.filter((x: any) => x.status === 'active').length,
      categoriesVisible: cd.filter((x: any) => x.is_visible).length,
      users: ud.length,
      usersActive: ud.filter((x: any) => x.is_active && !x.is_suspended).length,
      usersSuspended: ud.filter((x: any) => x.is_suspended).length,
      logs24h: logs24.count ?? 0,
      logs7d: logs7.count ?? 0,
      logsToday: logsToday.count ?? 0,
      trash: trash.count ?? 0,
      archives: archives.count ?? 0,
      totalDownloads:
        sd.reduce((a: number, x: any) => a + (x.downloads_count ?? 0), 0) +
        rd.reduce((a: number, x: any) => a + (x.downloads_count ?? 0), 0),
      byType: groupCount(sd, 'script_type'),
      byStatus: groupCount(sd, 'status'),
      byResourceType: groupCount(rd, 'resource_type'),
      topScripts: [...sd]
        .sort((a: any, b: any) => (b.views_count ?? 0) - (a.views_count ?? 0))
        .slice(0, 5)
        .map((x: any) => ({
          name: x.name?.length > 18 ? `${x.name.slice(0, 18)}…` : x.name,
          views: x.views_count ?? 0,
          downloads: x.downloads_count ?? 0,
        })),
      recentLogs: recent.data ?? [],
    });
    hasLoaded.current = true;
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    load();

    const scheduleRefresh = () => {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => load(), REFRESH_DEBOUNCE_MS);
    };

    const ch = supabase
      .channel('dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scripts' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trash_items' }, scheduleRefresh)
      .subscribe();

    const t = setInterval(() => load(), 30_000);

    return () => {
      clearTimeout(refreshTimer.current);
      supabase.removeChannel(ch);
      clearInterval(t);
    };
  }, [load]);

  if (!s) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          {loading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        </div>
      </DashboardLayout>
    );
  }

  const primaryCards = [
    { label: 'Scripts', value: s.scripts, sub: `${s.scriptsActive} actifs`, icon: FileCode2, tone: 'primary', to: '/scripts' },
    { label: 'Ressources', value: s.resources, sub: `${s.resourcesActive} actives`, icon: BookOpen, tone: 'info', to: '/resources' },
    { label: 'Catégories', value: s.categories, sub: `${s.categoriesVisible} visibles`, icon: FolderTree, tone: 'success', to: '/categories' },
    { label: 'Utilisateurs', value: s.users, sub: `${s.usersActive} actifs`, icon: Users, tone: 'warning', to: '/admin/users' },
    { label: 'Logs (24h)', value: s.logs24h, sub: `${s.logs7d} sur 7 jours`, icon: Activity, tone: 'primary', to: '/admin/audit-logs' },
  ];

  const detailCards = [
    { label: 'Scripts publics', value: s.scriptsPublic, sub: `${s.scriptsValidated} validés`, icon: Globe, tone: 'info' },
    { label: 'Scripts archivés', value: s.scriptsArchived, sub: `${s.scriptsDraft} brouillons`, icon: Archive, tone: 'primary' },
    { label: 'Ress. en avant', value: s.resourcesFeatured, sub: `${s.resourcesPublic} publiques`, icon: Star, tone: 'warning' },
    { label: 'Ress. archivées', value: s.resourcesArchived, sub: 'Hors catalogue actif', icon: Layers, tone: 'info' },
    { label: 'Catégories actives', value: s.categoriesActive, sub: `sur ${s.categories} total`, icon: CheckCircle2, tone: 'success' },
    { label: 'Logs aujourd’hui', value: s.logsToday, sub: 'Depuis minuit', icon: CalendarDays, tone: 'primary', to: '/admin/audit-logs' },
    { label: 'Utilis. suspendus', value: s.usersSuspended, sub: 'Comptes bloqués', icon: UserX, tone: 'destructive', to: '/admin/users' },
    { label: 'Téléchargements', value: s.totalDownloads, sub: 'Cumul plateforme', icon: Download, tone: 'success' },
    { label: 'Archives logs', value: s.archives, sub: 'Logs > 90j', icon: Archive, tone: 'info', to: '/admin/archives' },
    { label: 'Corbeille', value: s.trash, sub: 'À traiter', icon: Trash2, tone: 'destructive', to: '/admin/trash' },
  ];

  const toneClass: Record<string, string> = {
    primary: 'border-primary/30 from-primary/10 text-primary',
    info: 'border-info/30 from-info/10 text-info',
    success: 'border-success/30 from-success/10 text-success',
    warning: 'border-warning/30 from-warning/10 text-warning',
    destructive: 'border-destructive/30 from-destructive/10 text-destructive',
  };

  const renderCard = (c: (typeof primaryCards)[0]) => {
    const Comp: any = c.to ? Link : 'div';
    return (
      <Comp
        key={c.label}
        {...(c.to ? { to: c.to } : {})}
        className={`group rounded-xl border bg-gradient-to-br to-card p-4 shadow-sm transition-shadow hover:shadow-md ${toneClass[c.tone]}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{c.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{c.sub}</p>
          </div>
          <div className="rounded-lg border border-current/25 bg-current/10 p-2">
            <c.icon className="h-4 w-4" />
          </div>
        </div>
        {c.to && (
          <div className="mt-2 flex items-center gap-1 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
            Voir <ArrowUpRight className="h-3 w-3" />
          </div>
        )}
      </Comp>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                Dashboard temps réel
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Vue d’ensemble complète - scripts, ressources, utilisateurs, audit et engagement.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs text-success">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live
            </span>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vue principale</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{primaryCards.map(renderCard)}</div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Statistiques détaillées
          </h2>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {detailCards.map(renderCard)}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card p-5 lg:col-span-1">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Scripts par type
            </h3>
            {s.byType.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={s.byType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                    {s.byType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-5 lg:col-span-1">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-primary" /> Scripts par statut
            </h3>
            {s.byStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={s.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                    {s.byStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-5 lg:col-span-1">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-info" /> Ressources par type
            </h3>
            {s.byResourceType.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={s.byResourceType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                  >
                    {s.byResourceType.map((_, i) => (
                      <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-primary" /> Top scripts (vues & téléchargements)
            </h3>
            {s.topScripts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Aucun script</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={s.topScripts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="views" name="Vues" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="downloads" name="Téléchargements" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-primary" /> Activité récente
              </h3>
              <Link to="/admin/audit-logs" className="text-xs text-primary hover:underline">
                Voir tout
              </Link>
            </div>
            <ul className="divide-y divide-border/40 max-h-[260px] overflow-y-auto">
              {s.recentLogs.length === 0 && (
                <li className="py-3 text-sm text-muted-foreground text-center">Aucune activité</li>
              )}
              {s.recentLogs.map((l: any) => (
                <li key={l.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      <span className="text-primary">{l.action}</span> · {l.resource}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{l.user_email ?? 'système'}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                    {new Date(l.created_at).toLocaleString('fr-FR')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
