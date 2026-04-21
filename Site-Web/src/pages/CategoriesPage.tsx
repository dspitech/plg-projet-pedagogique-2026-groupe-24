import { Link } from 'react-router-dom';
import {
  Users,
  Layers,
  Rocket,
  Shield,
  ArrowUpRight,
  FileCode2,
  Search,
  Plus,
  LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { categories, scripts, Category } from '@/data/scripts';

const iconMap: Record<Category, LucideIcon> = {
  users: Users,
  resources: Layers,
  deployment: Rocket,
  network: Shield,
};

const accentMap: Record<Category, { bg: string; text: string; ring: string; bar: string }> = {
  users: { bg: 'bg-blue-500/10', text: 'text-blue-400', ring: 'ring-blue-500/20', bar: 'bg-blue-500' },
  resources: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20', bar: 'bg-emerald-500' },
  deployment: { bg: 'bg-orange-500/10', text: 'text-orange-400', ring: 'ring-orange-500/20', bar: 'bg-orange-500' },
  network: { bg: 'bg-rose-500/10', text: 'text-rose-400', ring: 'ring-rose-500/20', bar: 'bg-rose-500' },
};

export default function CategoriesPage() {
  const totalScripts = scripts.length || 1;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <header className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-foreground">Catégories</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Catégories de scripts
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Explorez le catalogue organisé par domaine d'administration cloud. Cliquez sur une
                catégorie pour accéder aux scripts associés.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="px-3 py-2 rounded-lg border border-border/60 bg-card">
                <p className="text-muted-foreground">Catégories</p>
                <p className="text-lg font-bold text-foreground tabular-nums">{categories.length}</p>
              </div>
              <div className="px-3 py-2 rounded-lg border border-border/60 bg-card">
                <p className="text-muted-foreground">Scripts</p>
                <p className="text-lg font-bold text-foreground tabular-nums">{scripts.length}</p>
              </div>
              <Button asChild size="sm" className="ml-2">
                <Link to="/categories/new"><Plus className="h-4 w-4" /> Nouvelle</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Search hint bar */}
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Astuce : utilisez la recherche du header pour filtrer rapidement parmi toutes les catégories.
          </p>
        </div>

        {/* Categories grid — pro dense cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const Icon = iconMap[cat.id as Category];
            const accent = accentMap[cat.id as Category];
            const count = scripts.filter((s) => s.category === cat.id).length;
            const percent = Math.round((count / totalScripts) * 100);

            return (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${accent.bg} ${accent.text} ${accent.ring}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        category/{cat.id}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>

                {/* Description */}
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{cat.description}</p>

                {/* Meta row */}
                <div className="mt-5 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileCode2 className="h-3.5 w-3.5" />
                    <span className="tabular-nums font-medium text-foreground">{count}</span>
                    <span>script{count > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className={`h-1.5 w-1.5 rounded-full ${accent.bar}`} />
                    <span>{percent}% du catalogue</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1 w-full rounded-full bg-secondary/60 overflow-hidden">
                  <div
                    className={`h-full ${accent.bar} transition-all duration-500`}
                    style={{ width: `${Math.max(percent, 2)}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </section>

        {/* Empty / info footer */}
        <section className="rounded-xl border border-dashed border-border/60 bg-card/50 p-5 text-center">
          <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Besoin d'une nouvelle catégorie ?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Contactez l'équipe Cloud Ops pour proposer un nouveau domaine d'administration.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
