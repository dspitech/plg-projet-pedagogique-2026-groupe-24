import {
  CheckCircle2,
  Cloud,
  Server,
  ShieldCheck,
  Workflow,
  BookOpenText,
  Rocket,
  GitBranch,
  FolderGit2,
  Building2,
  Scale,
  LockKeyhole,
  LifeBuoy,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Users2,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ScriptCard } from '@/components/dashboard/ScriptCard';
import { CategoryCard } from '@/components/dashboard/CategoryCard';
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
} from 'recharts';

const Dashboard = () => {
  const recentScripts = scripts.slice(0, 4);
  const platformCards = [
    {
      title: 'Scripts Azure prets a l emploi',
      description: 'Automatisez rapidement vos operations Azure avec des scripts standardises.',
      icon: Cloud,
      style: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      title: 'Scripts AWS prets a l emploi',
      description: 'Unifiez la gestion multi-cloud avec des scripts AWS utilisables immediatement.',
      icon: Server,
      style: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      title: 'Securite et conformite',
      description: 'Appliquez des scripts controles pour renforcer la securite de vos environnements.',
      icon: ShieldCheck,
      style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Documentation operationnelle',
      description: 'Chaque script est pense pour etre compris et reutilise par vos equipes.',
      icon: BookOpenText,
      style: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
  ];

  const workflowSteps = [
    {
      title: '1. Ajouter',
      description: 'Ajoutez vos scripts via le futur formulaire de creation.',
      icon: FolderGit2,
    },
    {
      title: '2. Structurer',
      description: 'Classez par categorie, provider et tags pour faciliter la recherche.',
      icon: GitBranch,
    },
    {
      title: '3. Partager',
      description: 'Diffusez les scripts a vos equipes pour une execution rapide.',
      icon: Workflow,
    },
    {
      title: '4. Executer',
      description: 'Utilisez des scripts prets a l emploi pour accelerer la production.',
      icon: Rocket,
    },
  ];

  const governanceCards = [
    {
      title: 'Gouvernance cloud',
      description: 'Cadrez les standards de scripting et les bonnes pratiques inter-equipes.',
      icon: Building2,
    },
    {
      title: 'Conformite et audit',
      description: 'Uniformisez les controles pour faciliter audit interne et externe.',
      icon: Scale,
    },
    {
      title: 'Gestion des acces',
      description: 'Encadrez les droits et la reutilisation des scripts sensibles.',
      icon: LockKeyhole,
    },
    {
      title: 'Support operationnel',
      description: 'Donnez aux equipes une base commune pour resoudre plus vite.',
      icon: LifeBuoy,
    },
  ];

  const qualityPillars = [
    {
      title: 'Validation technique',
      text: 'Scripts verifies avant publication sur le hub interne.',
      icon: ClipboardCheck,
    },
    {
      title: 'Documentation standard',
      text: 'Format unique pour la maintenance et la transmission.',
      icon: FileText,
    },
    {
      title: 'Formation continue',
      text: 'Guides et parcours pour l adoption des scripts cloud.',
      icon: GraduationCap,
    },
    {
      title: 'Collaboration equipe',
      text: 'Partage de connaissances entre cloud ops, secops et devops.',
      icon: Users2,
    },
  ];

  const providerData = useMemo(() => {
    const counts = scripts.reduce<Record<string, number>>((acc, script) => {
      const key = script.provider || 'other';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  }, []);

  const categoryData = useMemo(
    () =>
      categories.map((cat) => ({
        name: cat.name,
        value: scripts.filter((script) => script.category === cat.id).length,
      })),
    []
  );

  const languageData = useMemo(() => {
    const counts = scripts.reduce<Record<string, number>>((acc, script) => {
      const key = script.language || 'Other';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const providerColors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];
  const categoryColor = '#3B82F6';
  const languageColor = '#8B5CF6';

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bienvenue sur <span className="text-gradient">Azure Scripts</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Plateforme centralisée pour gérer, documenter et exploiter vos scripts Azure
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Catalogue prêt à l'utilisation</span>
          </div>
        </div>

        {/* Platform Highlights */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Ce que vous pouvez faire</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {platformCards.map((card) => (
              <article key={card.title} className="glass-card rounded-xl p-5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border ${card.style}`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{card.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Catégories</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                id={cat.id as Category}
                name={cat.name}
                description={cat.description}
              />
            ))}
          </div>
        </section>

        {/* Recent Scripts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Scripts Récents</h2>
          </div>
          {recentScripts.length === 0 ? (
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-muted-foreground">
                Aucun script pour le moment. Les scripts seront ajoutes via formulaire.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentScripts.map((script) => (
                <ScriptCard key={script.id} script={script} />
              ))}
            </div>
          )}
        </section>

        {/* Additional Dashboard Sections */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <article className="glass-card rounded-xl p-6 xl:col-span-2">
            <h2 className="text-lg font-semibold text-foreground">Parcours de publication</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Le dashboard est pret pour accueillir des scripts dynamiques depuis formulaire et base.
            </p>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {workflowSteps.map((step) => (
                <div key={step.title} className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <step.icon className="h-4 w-4 text-primary" />
                    {step.title}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Acces rapides</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ouvrez directement les zones les plus utilisees.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                to="/scripts"
                className="rounded-lg border border-border/60 px-4 py-2 text-sm hover:bg-secondary/40 transition-colors"
              >
                Bibliotheque de scripts
              </Link>
              <Link
                to="/categories"
                className="rounded-lg border border-border/60 px-4 py-2 text-sm hover:bg-secondary/40 transition-colors"
              >
                Categories cloud
              </Link>
              <Link
                to="/provider/azure"
                className="rounded-lg border border-border/60 px-4 py-2 text-sm hover:bg-secondary/40 transition-colors"
              >
                Scripts Microsoft Azure
              </Link>
              <Link
                to="/provider/aws"
                className="rounded-lg border border-border/60 px-4 py-2 text-sm hover:bg-secondary/40 transition-colors"
              >
                Scripts AWS
              </Link>
            </div>
          </article>
        </section>

        {/* Enterprise Static Sections */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Cadre entreprise</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {governanceCards.map((item) => (
              <article key={item.title} className="glass-card rounded-xl p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <article className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Standards de publication</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Une trame commune pour garder un hub fiable et maintenable.
            </p>
            <div className="mt-4 space-y-2">
              <div className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
                Nommage unifie des scripts et conventions de versionnement.
              </div>
              <div className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
                Documentation obligatoire des prerequis, parametres et impacts.
              </div>
              <div className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
                Validation securite avant diffusion a l ensemble des equipes.
              </div>
              <div className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
                Revision collaborative pour assurer qualite et reutilisabilite.
              </div>
            </div>
          </article>

          <article className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Piliers qualite</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Base statique de reference pour un dashboard entreprise.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {qualityPillars.map((pillar) => (
                <div key={pillar.title} className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <pillar.icon className="h-4 w-4 text-primary" />
                    {pillar.title}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{pillar.text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* Dynamic Charts */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <article className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Repartition par provider</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Graphique dynamique base sur les scripts Azure, AWS et autres.
            </p>
            <div className="mt-4 h-72">
              {providerData.length === 0 ? (
                <div className="h-full rounded-lg border border-border/60 bg-background/40 flex items-center justify-center text-sm text-muted-foreground">
                  Aucune donnee script disponible.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={providerData} dataKey="value" nameKey="name" outerRadius={95} innerRadius={45}>
                      {providerData.map((_, index) => (
                        <Cell key={`provider-cell-${index}`} fill={providerColors[index % providerColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          <article className="glass-card rounded-xl p-6 xl:col-span-2">
            <h2 className="text-lg font-semibold text-foreground">Repartition par categorie</h2>
            <p className="mt-1 text-sm text-muted-foreground">Visualisation dynamique des scripts par domaine.</p>
            <div className="mt-4 h-72">
              {scripts.length === 0 ? (
                <div className="h-full rounded-lg border border-border/60 bg-background/40 flex items-center justify-center text-sm text-muted-foreground">
                  Aucune donnee script disponible.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill={categoryColor} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>
        </section>

        <section>
          <article className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Repartition par langage</h2>
            <p className="mt-1 text-sm text-muted-foreground">Graphique dynamique des technologies de scripts.</p>
            <div className="mt-4 h-72">
              {languageData.length === 0 ? (
                <div className="h-full rounded-lg border border-border/60 bg-background/40 flex items-center justify-center text-sm text-muted-foreground">
                  Aucune donnee script disponible.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={languageData} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill={languageColor} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
