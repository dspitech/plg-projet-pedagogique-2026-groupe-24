import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Cloud,
  Server,
  ShieldCheck,
  BookOpenText,
  FileCode2,
  Activity,
  TrendingUp,
  Layers,
  Users,
  Rocket,
  Shield,
  ArrowUpRight,
  Zap,
  GitBranch,
  Package,
  Terminal,
  Database,
  CheckCircle2,
  Clock,
  Star,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { categories, scripts, Category } from '@/data/scripts';
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

const Dashboard = () => {
  const totalScripts = scripts.length;
  const azureCount = scripts.filter((s) => s.provider === 'azure').length;
  const awsCount = scripts.filter((s) => s.provider === 'aws').length;
  const validatedCount = scripts.filter((s) => s.validated).length;

  const kpis = [
    {
      label: 'Scripts disponibles',
      value: totalScripts,
      delta: '+0 ce mois',
      icon: FileCode2,
      tone: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Microsoft Azure',
      value: azureCount,
      delta: 'Provider principal',
      icon: Cloud,
      tone: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Amazon Web Services',
      value: awsCount,
      delta: 'Multi-cloud',
      icon: Server,
      tone: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Scripts validés',
      value: validatedCount,
      delta: 'Production-ready',
      icon: ShieldCheck,
      tone: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  const providerData = useMemo(() => {
    const counts = scripts.reduce<Record<string, number>>((acc, s) => {
      const k = s.provider || 'other';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const fallback = totalScripts === 0 ? [{ name: 'AZURE', value: 1 }, { name: 'AWS', value: 1 }] : [];
    return Object.entries(counts).map(([name, value]) => ({ name: name.toUpperCase(), value })).concat(fallback);
  }, [totalScripts]);

  const categoryData = useMemo(
    () =>
      categories.map((cat) => ({
        name: cat.name.split(' ')[0],
        scripts: scripts.filter((s) => s.category === cat.id).length,
      })),
    []
  );

  const activityFeed = [
    { icon: GitBranch, text: 'Nouveau script Azure ajouté', meta: 'il y a 2h', tone: 'text-blue-400' },
    { icon: ShieldCheck, text: 'Script validé en production', meta: 'il y a 5h', tone: 'text-emerald-400' },
    { icon: Package, text: 'Mise à jour catégorie Réseau', meta: 'hier', tone: 'text-violet-400' },
    { icon: Star, text: '3 scripts ajoutés aux favoris', meta: 'hier', tone: 'text-amber-400' },
    { icon: Terminal, text: 'Documentation mise à jour', meta: 'il y a 2j', tone: 'text-primary' },
  ];

  const quickLinks = [
    { to: '/scripts', label: 'Tous les scripts', desc: 'Bibliothèque complète', icon: FileCode2 },
    { to: '/categories', label: 'Catégories', desc: 'Explorer par domaine', icon: Layers },
    { to: '/provider/azure', label: 'Azure', desc: `${azureCount} scripts`, icon: Cloud },
    { to: '/provider/aws', label: 'AWS', desc: `${awsCount} scripts`, icon: Server },
    { to: '/resources', label: 'Ressources', desc: 'Documentation & liens', icon: BookOpenText },
    { to: '/favorites', label: 'Favoris', desc: 'Vos scripts épinglés', icon: Star },
  ];

  const PROVIDER_COLORS = ['hsl(199 89% 48%)', 'hsl(38 92% 50%)', 'hsl(142 71% 45%)', 'hsl(280 70% 60%)'];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Hero header — dense pro style */}
        <header className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-success/10 text-success border border-success/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Opérationnel
                </span>
                <span>•</span>
                <span>Build v1.0.0</span>
                <span>•</span>
                <span>Dernière sync: maintenant</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Vue d'ensemble du catalogue
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Plateforme centralisée pour gérer, documenter et exploiter vos scripts Azure & AWS.
                Accès rapide, gouvernance et traçabilité unifiés.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/scripts"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <FileCode2 className="h-4 w-4" /> Parcourir le catalogue
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 text-sm font-medium hover:bg-secondary/40 transition-colors"
              >
                <Layers className="h-4 w-4" /> Catégories
              </Link>
            </div>
          </div>
        </header>

        {/* KPI grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <article
              key={kpi.label}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground tabular-nums">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {kpi.delta}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bg} ${kpi.tone}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </article>
          ))}
        </section>

        {/* Charts row */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <article className="xl:col-span-2 rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground">Scripts par catégorie</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Distribution dans le catalogue</p>
              </div>
              <span className="text-xs text-muted-foreground px-2 py-1 rounded-md bg-secondary/50">
                {totalScripts} total
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="scripts" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground">Par provider</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Multi-cloud</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providerData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {providerData.map((_, i) => (
                      <Cell key={i} fill={PROVIDER_COLORS[i % PROVIDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        {/* Activity + Quick links */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <article className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">Activité récente</h2>
              </div>
              <Link to="/history" className="text-xs text-primary hover:underline">
                Voir tout
              </Link>
            </div>
            <ul className="space-y-3">
              {activityFeed.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0"
                >
                  <div className={`mt-0.5 ${a.tone}`}>
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {a.meta}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="xl:col-span-2 rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">Accès rapides</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickLinks.map((q) => (
                <Link
                  key={q.to}
                  to={q.to}
                  className="group flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3 hover:border-primary/40 hover:bg-secondary/30 transition-all"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <q.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{q.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{q.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </article>
        </section>

        {/* System status footer card */}
        <section className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">État de la plateforme</h2>
            </div>
            <span className="text-xs text-muted-foreground">Mis à jour à l'instant</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'API', status: 'Opérationnel', tone: 'text-success', dot: 'bg-success' },
              { label: 'Catalogue', status: 'Opérationnel', tone: 'text-success', dot: 'bg-success' },
              { label: 'Recherche', status: 'Opérationnel', tone: 'text-success', dot: 'bg-success' },
              { label: 'CDN', status: 'Opérationnel', tone: 'text-success', dot: 'bg-success' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border/40 bg-background/40 p-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2 w-2 rounded-full ${s.dot} animate-pulse`} />
                  <span className={`text-sm font-medium ${s.tone}`}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
