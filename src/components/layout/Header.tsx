import {
  Search,
  Bell,
  User,
  CalendarDays,
  Clock3,
  MapPin,
  Command,
  LogOut,
  Settings,
  Loader2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLocation } from '@/hooks/useUserLocation';
import { getTimezoneShort } from '@/lib/userLocation';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const ROLE_LABELS = {
  global_admin: 'Admin Global',
  admin: 'Administrateur',
  editor: 'Editeur',
  viewer: 'Lecteur',
} as const;

export function Header() {
  const { profile, roles, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [logsCount, setLogsCount] = useState(0);
  const navigate = useNavigate();

  const profileHint = useMemo(
    () => ({
      city: (profile as { city?: string } | null)?.city,
      country: (profile as { country?: string } | null)?.country,
      address: (profile as { address?: string } | null)?.address,
    }),
    [profile],
  );

  const { location, loading: locationLoading } = useUserLocation(profileHint);

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

  const timeZone = location?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Local';

  const dateParts = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).formatToParts(now);

  const weekday = dateParts.find((p) => p.type === 'weekday')?.value ?? '';
  const dayMonthYear =
    `${dateParts.find((p) => p.type === 'day')?.value ?? ''} ${dateParts.find((p) => p.type === 'month')?.value ?? ''} ${dateParts.find((p) => p.type === 'year')?.value ?? ''}`.trim();

  const timeLabel = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone,
  }).format(now);

  const tzShort = getTimezoneShort(now, timeZone);

  const displayName = profile?.name || profile?.email || 'Utilisateur';
  const avatarUrl = (profile as { avatar_url?: string } | null)?.avatar_url;
  const initials = (displayName?.trim()?.[0] ?? 'U').toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const locationPrimary = location?.city ?? location?.line1?.split(',')[0]?.trim() ?? '—';
  const locationSecondary = [location?.postalCode, location?.country ?? location?.line2]
    .filter(Boolean)
    .join(' · ');

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="flex min-h-[4.25rem] items-center justify-between gap-4 px-4 py-2.5 lg:px-6">
        <form onSubmit={handleSearch} className="min-w-0 flex-1 max-w-2xl">
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

        <div className="flex shrink-0 items-center gap-3 lg:gap-4">
          <div
            className={cn(
              'hidden lg:flex items-center rounded-2xl border border-border/50',
              'bg-card/50 shadow-sm ring-1 ring-white/5',
            )}
          >
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <CalendarDays className="h-[18px] w-[18px] text-primary" />
              </span>
              <div className="flex flex-col justify-center gap-1">
                <span className="text-sm font-semibold capitalize leading-none text-foreground">{weekday}</span>
                <span className="text-xs leading-none text-muted-foreground">{dayMonthYear}</span>
              </div>
            </div>

            <div className="h-11 w-px shrink-0 bg-border/50" />

            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <Clock3 className="h-[18px] w-[18px] text-primary" />
              </span>
              <div className="flex flex-col justify-center gap-1">
                <span className="font-mono text-base font-semibold tabular-nums leading-none tracking-wide text-foreground">
                  {timeLabel}
                </span>
                <span className="text-xs leading-none text-muted-foreground">{tzShort}</span>
              </div>
            </div>

            <div className="h-11 w-px shrink-0 bg-border/50" />

            <div className="flex min-w-[9.5rem] max-w-[12rem] items-center gap-3 px-5 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <MapPin className="h-[18px] w-[18px] text-primary" />
              </span>
              {locationLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Chargement…</span>
                </div>
              ) : (
                <div className="flex min-w-0 flex-col justify-center gap-1">
                  <span className="truncate text-sm font-semibold leading-none text-foreground" title={locationPrimary}>
                    {locationPrimary}
                  </span>
                  {locationSecondary ? (
                    <span
                      className="truncate text-xs leading-none text-muted-foreground"
                      title={locationSecondary}
                    >
                      {locationSecondary}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/audit-logs')}
            title="Voir les logs et audits"
            className="relative flex h-10 min-w-10 items-center justify-center rounded-lg px-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums">
              {logsCount > 99 ? '99+' : logsCount}
            </span>
          </button>

          <div className="flex items-center gap-3 border-l border-border/70 pl-3 lg:pl-4">
            <div className="hidden sm:block text-right">
              <p className="max-w-[180px] truncate text-sm font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-offset-background transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Avatar className="h-10 w-10 border border-border/70">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2">
                  <User className="h-5 w-5" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2">
                  <Settings className="h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
