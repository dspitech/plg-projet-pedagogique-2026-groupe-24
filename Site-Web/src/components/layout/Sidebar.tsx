import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  FileCode2,
  BookOpen,
  FolderTree,
  Cloud,
  Server,
  Mail,
  Star,
  Share2,
  Download,
  History,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useUserData';
import { toast } from 'sonner';

type NavItem = { id: string; name: string; icon: typeof Home; path: string };

const sections: { label?: string; items: NavItem[] }[] = [
  {
    label: 'Navigation',
    items: [
      { id: 'home', name: 'Accueil', icon: Home, path: '/' },
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { id: 'scripts', name: 'Tous les Scripts', icon: FileCode2, path: '/scripts' },
      { id: 'resources', name: 'Ressources', icon: BookOpen, path: '/resources' },
      { id: 'categories', name: 'Catégories', icon: FolderTree, path: '/categories' },
    ],
  },
  {
    label: 'Fournisseurs Cloud',
    items: [
      { id: 'azure', name: 'Azure', icon: Cloud, path: '/provider/azure' },
      { id: 'aws', name: 'AWS', icon: Server, path: '/provider/aws' },
    ],
  },
  {
    label: 'Mon espace',
    items: [
      { id: 'favorites', name: 'Favoris', icon: Star, path: '/favorites' },
      { id: 'shares', name: 'Partages', icon: Share2, path: '/shares' },
      { id: 'downloads', name: 'Téléchargements', icon: Download, path: '/downloads' },
      { id: 'history', name: 'Historique', icon: History, path: '/history' },
    ],
  },
  {
    label: 'Compte',
    items: [
      { id: 'profile', name: 'Profil', icon: User, path: '/profile' },
      { id: 'contact', name: 'Contact', icon: Mail, path: '/contact' },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    toast.success('Vous avez été déconnecté');
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border shrink-0">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Terminal className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-sidebar-foreground truncate">
                Cloud Scripts
              </span>
              <span className="text-xs text-muted-foreground truncate">Dashboard Pro</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          aria-label={collapsed ? 'Déplier la sidebar' : 'Replier la sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && section.label && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={cn('nav-item', isActive(item.path) && 'active')}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 shrink-0">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Se déconnecter' : undefined}
          className="nav-item w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Se déconnecter</span>}
        </button>
      </div>
    </aside>
  );
}
