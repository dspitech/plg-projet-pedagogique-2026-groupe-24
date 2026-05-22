import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCode2,
  BookOpen,
  FolderTree,
  Users,
  ScrollText,
  Archive,
  Trash2,
  User,
  Mail,
  Terminal,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type NavCard = {
  title: string;
  description: string;
  path: string;
  icon: typeof FileCode2;
  accent: string;
  adminOnly?: boolean;
};

const mainCards: NavCard[] = [
  {
    title: 'Dashboard',
    description: 'Statistiques et activité en temps réel',
    path: '/dashboard',
    icon: LayoutDashboard,
    accent: 'border-primary/40 bg-gradient-to-br from-card via-card to-primary/10 text-primary',
  },
  {
    title: 'Scripts',
    description: 'Créer, modifier et organiser vos scripts',
    path: '/scripts',
    icon: FileCode2,
    accent: 'border-blue-500/40 bg-gradient-to-br from-card via-card to-blue-500/10 text-blue-400',
  },
  {
    title: 'Ressources',
    description: 'Liens, documents et fichiers partagés',
    path: '/resources',
    icon: BookOpen,
    accent: 'border-info/40 bg-gradient-to-br from-card via-card to-info/10 text-info',
  },
  {
    title: 'Catégories',
    description: 'Structure et classification du contenu',
    path: '/categories',
    icon: FolderTree,
    accent: 'border-success/40 bg-gradient-to-br from-card via-card to-success/10 text-success',
  },
];

const accountCards: NavCard[] = [
  {
    title: 'Profil',
    description: 'Vos informations et préférences',
    path: '/profile',
    icon: User,
    accent: 'border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 text-foreground',
  },
  {
    title: 'Contact',
    description: 'Nous écrire ou demander de l’aide',
    path: '/contact',
    icon: Mail,
    accent: 'border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 text-muted-foreground',
  },
];

const adminCards: NavCard[] = [
  {
    title: 'Utilisateurs',
    description: 'Invitations, rôles et accès',
    path: '/admin/users',
    icon: Users,
    accent: 'border-warning/40 bg-gradient-to-br from-card via-card to-warning/10 text-warning',
    adminOnly: true,
  },
  {
    title: 'Logs & Audit',
    description: 'Historique des actions sur la plateforme',
    path: '/admin/audit-logs',
    icon: ScrollText,
    accent: 'border-violet-500/40 bg-gradient-to-br from-card via-card to-violet-500/10 text-violet-400',
    adminOnly: true,
  },
  {
    title: 'Archives',
    description: 'Logs archivés et exports',
    path: '/admin/archives',
    icon: Archive,
    accent: 'border-info/40 bg-gradient-to-br from-card via-card to-info/10 text-info',
    adminOnly: true,
  },
  {
    title: 'Corbeille',
    description: 'Éléments supprimés à restaurer',
    path: '/admin/trash',
    icon: Trash2,
    accent: 'border-destructive/40 bg-gradient-to-br from-card via-card to-destructive/10 text-destructive',
    adminOnly: true,
  },
];

function QuickNavCard({ card, delay = 0 }: { card: NavCard; delay?: number }) {
  const Icon = card.icon;
  return (
    <Link
      to={card.path}
      className={cn(
        'group relative overflow-hidden rounded-xl border p-5 transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 animate-fade-in',
        card.accent,
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-current/10 blur-2xl transition group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-current/20 bg-background/40 mb-3 transition-transform group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-foreground">{card.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-snug">{card.description}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 opacity-40 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}

export default function Index() {
  const { hasRole, profile } = useAuth();
  const isAdmin = hasRole('global_admin');
  const allCards = [...mainCards, ...accountCards, ...(isAdmin ? adminCards : [])];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8 animate-fade-in pb-8">
        <section className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Terminal className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] text-primary mb-3">
                <Sparkles className="h-3 w-3" /> Azure Script Hub
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Bienvenue{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Plateforme centralisée pour gérer vos scripts cloud, ressources et catégories, avec audit,
                archives et corbeille. Choisissez une section ci-dessous pour accéder rapidement à l’espace souhaité.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Accès rapide
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allCards.map((card, i) => (
              <QuickNavCard key={card.path} card={card} delay={i * 50} />
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
