import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  FileCode2,
  BookOpen,
  FolderTree,
  Mail,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Users as UsersIcon,
  ScrollText,
  Archive,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';

type NavItem = { id: string; name: string; icon: typeof Home; path: string };

const sections: { label?: string; items: NavItem[]; adminOnly?: boolean }[] = [
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
    label: 'Administration',
    adminOnly: true,
    items: [
      { id: 'users', name: 'Utilisateurs', icon: UsersIcon, path: '/admin/users' },
      { id: 'audit', name: 'Logs & Audit', icon: ScrollText, path: '/admin/audit-logs' },
      { id: 'archives', name: 'Archives', icon: Archive, path: '/admin/archives' },
      { id: 'trash', name: 'Corbeille', icon: Trash2, path: '/admin/trash' },
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
  const { signOut, hasRole, profile, roles } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Vous avez été déconnecté');
    navigate('/login');
  };

  const visibleSections = sections.filter((s) => !s.adminOnly || hasRole('global_admin'));

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border shrink-0">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Terminal className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-sidebar-foreground truncate">Cloud Scripts</span>
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

      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {visibleSections.map((section, idx) => (
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

      {!collapsed && profile && (
        <div className="border-t border-sidebar-border p-3 shrink-0">
          <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-sidebar-accent/30">
            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              {profile.name.slice(0, 2).toUpperCase() || profile.email.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{profile.name || profile.email}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {roles.includes('global_admin') ? 'Admin Global' : roles[0] ?? 'Aucun rôle'}
              </p>
            </div>
          </div>
        </div>
      )}

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
