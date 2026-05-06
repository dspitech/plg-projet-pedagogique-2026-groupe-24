import { Search, Bell, User, CalendarDays, Clock3, MapPin, Command } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ROLE_LABELS = {
  global_admin: 'Admin Global',
  admin: 'Administrateur',
  editor: 'Editeur',
  viewer: 'Lecteur',
} as const;

export function Header() {
  const { profile, roles } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [logsCount, setLogsCount] = useState(0);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/scripts?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;

    const loadLogsCount = async () => {
      const { count } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact', head: true });
      if (active) setLogsCount(count ?? 0);
    };

    loadLogsCount();
    const refreshInterval = window.setInterval(loadLogsCount, 30000);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  const roleLabel = useMemo(() => {
    if (roles.includes('global_admin')) return ROLE_LABELS.global_admin;
    if (roles.includes('admin')) return ROLE_LABELS.admin;
    if (roles.includes('editor')) return ROLE_LABELS.editor;
    if (roles.includes('viewer')) return ROLE_LABELS.viewer;
    return 'Aucun role';
  }, [roles]);

  const dateLabel = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(now);

  const timeLabel = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Local';
  const localeLabel = navigator.language.toUpperCase();
  const locationLabel = timeZone;
  const displayName = profile?.name || profile?.email || 'Utilisateur';

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/90 backdrop-blur-xl border-b border-border/70">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="group relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Rechercher un script, une commande, une catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-border/70 bg-card/70 pl-11 pr-16 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/80 focus:border-primary/50 focus:bg-card focus:ring-2 focus:ring-primary/20"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border/70 bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground md:flex">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-4 ml-6">
          <div className="hidden xl:flex items-center gap-3 rounded-xl border border-border/70 bg-card/70 px-3.5 py-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="tabular-nums">{dateLabel}</span>
            </div>
            <div className="h-6 w-px bg-border/70" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Clock3 className="h-3.5 w-3.5" />
              <span className="tabular-nums">{timeLabel}</span>
            </div>
            <div className="h-6 w-px bg-border/70" />
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
              <MapPin className="h-3.5 w-3.5" />
              <span>{localeLabel} - {locationLabel}</span>
            </div>
          </div>

          {/* Notifications */}
          <button
            onClick={() => navigate('/admin/audit-logs')}
            title="Voir les logs et audits"
            className="relative flex h-10 min-w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors px-2"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums">
              {logsCount > 99 ? '99+' : logsCount}
            </span>
          </button>

          {/* User */}
          <div className="flex items-center gap-3 pl-4 border-l border-border/70">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-foreground truncate max-w-[180px]">{displayName}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
