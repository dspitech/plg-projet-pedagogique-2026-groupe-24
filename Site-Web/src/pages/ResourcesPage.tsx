import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  BookOpen,
  Github,
  FileText,
  Video,
  Cloud,
  Server,
  Search,
  Library,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Resource {
  title: string;
  description: string;
  url: string;
  icon: typeof BookOpen;
  category: string;
  type: 'Doc' | 'CLI' | 'Repo' | 'Vidéo' | 'Guide';
}

const resources: Resource[] = [
  { title: 'Microsoft Learn — Azure', description: 'Documentation officielle, tutoriels et parcours certifiants Azure.', url: 'https://learn.microsoft.com/azure/', icon: Cloud, category: 'Azure', type: 'Doc' },
  { title: 'Azure PowerShell Docs', description: 'Référence complète des cmdlets Az PowerShell.', url: 'https://learn.microsoft.com/powershell/azure/', icon: FileText, category: 'Azure', type: 'CLI' },
  { title: 'Azure CLI Reference', description: 'Toutes les commandes az et leurs paramètres.', url: 'https://learn.microsoft.com/cli/azure/', icon: FileText, category: 'Azure', type: 'CLI' },
  { title: 'Bicep Documentation', description: 'Langage déclaratif pour le déploiement de ressources Azure.', url: 'https://learn.microsoft.com/azure/azure-resource-manager/bicep/', icon: BookOpen, category: 'Azure', type: 'Guide' },
  { title: 'AWS Documentation', description: 'Centre de documentation officiel AWS.', url: 'https://docs.aws.amazon.com/', icon: Server, category: 'AWS', type: 'Doc' },
  { title: 'AWS CLI Reference', description: 'Référence complète de la CLI AWS.', url: 'https://docs.aws.amazon.com/cli/', icon: FileText, category: 'AWS', type: 'CLI' },
  { title: 'Terraform Registry', description: 'Modules et providers Terraform pour Azure et AWS.', url: 'https://registry.terraform.io/', icon: Github, category: 'IaC', type: 'Repo' },
  { title: 'Azure Architecture Center', description: 'Patterns, références d\'architecture et best practices.', url: 'https://learn.microsoft.com/azure/architecture/', icon: BookOpen, category: 'Architecture', type: 'Guide' },
  { title: 'AWS Well-Architected', description: 'Framework et bonnes pratiques pour vos workloads AWS.', url: 'https://aws.amazon.com/architecture/well-architected/', icon: BookOpen, category: 'Architecture', type: 'Guide' },
  { title: 'GitHub — Azure Samples', description: 'Dépôt officiel d\'exemples et templates Azure.', url: 'https://github.com/Azure-Samples', icon: Github, category: 'Communauté', type: 'Repo' },
  { title: 'GitHub — AWS Samples', description: 'Dépôt officiel d\'exemples et templates AWS.', url: 'https://github.com/aws-samples', icon: Github, category: 'Communauté', type: 'Repo' },
  { title: 'YouTube — John Savill', description: 'Tutoriels vidéo Azure de référence.', url: 'https://www.youtube.com/@NTFAQGuy', icon: Video, category: 'Communauté', type: 'Vidéo' },
];

const categoryAccent: Record<string, { bg: string; text: string; ring: string }> = {
  Azure: { bg: 'bg-blue-500/10', text: 'text-blue-400', ring: 'ring-blue-500/20' },
  AWS: { bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/20' },
  IaC: { bg: 'bg-violet-500/10', text: 'text-violet-400', ring: 'ring-violet-500/20' },
  Architecture: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  Communauté: { bg: 'bg-rose-500/10', text: 'text-rose-400', ring: 'ring-rose-500/20' },
};

const typeStyle: Record<Resource['type'], string> = {
  Doc: 'bg-primary/10 text-primary border-primary/20',
  CLI: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Repo: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Vidéo: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Guide: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function ResourcesPage() {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<string>('Tous');

  const allCategories = useMemo(() => ['Tous', ...Array.from(new Set(resources.map((r) => r.category)))], []);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchCat = activeCat === 'Tous' || r.category === activeCat;
      const matchQuery =
        !query ||
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [query, activeCat]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, Resource[]>>((acc, r) => {
      (acc[r.category] = acc[r.category] || []).push(r);
      return acc;
    }, {});
  }, [filtered]);

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
                <span className="text-foreground">Ressources</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <Library className="h-6 w-6 text-primary" />
                Bibliothèque de ressources
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Liens curés vers la documentation officielle, les références CLI, les dépôts GitHub
                et les contenus communautaires pour Azure, AWS et l'Infrastructure as Code.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="px-3 py-2 rounded-lg border border-border/60 bg-card">
                <p className="text-muted-foreground">Ressources</p>
                <p className="text-lg font-bold text-foreground tabular-nums">{resources.length}</p>
              </div>
              <div className="px-3 py-2 rounded-lg border border-border/60 bg-card">
                <p className="text-muted-foreground">Catégories</p>
                <p className="text-lg font-bold text-foreground tabular-nums">{allCategories.length - 1}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Search + filters */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher dans les ressources..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                  activeCat === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary/40 text-muted-foreground border-border/60 hover:bg-secondary/70 hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        {Object.keys(grouped).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/50 p-10 text-center">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Aucune ressource trouvée</p>
            <p className="text-xs text-muted-foreground mt-1">Modifiez vos critères de recherche.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => {
            const accent = categoryAccent[cat] || categoryAccent.Architecture;
            return (
              <section key={cat}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-md ring-1 ${accent.bg} ${accent.text} ${accent.ring}`}>
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <h2 className="font-semibold text-foreground">{cat}</h2>
                    <span className="text-xs text-muted-foreground tabular-nums">({items.length})</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {items.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${accent.bg} ${accent.text} ${accent.ring}`}>
                          <r.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {r.title}
                            </h3>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {r.description}
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${typeStyle[r.type]}`}>
                              {r.type}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono truncate">
                              {new URL(r.url).hostname.replace('www.', '')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
