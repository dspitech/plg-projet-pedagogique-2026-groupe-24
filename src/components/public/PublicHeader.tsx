import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Cloud, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/qui-sommes-nous', label: 'Qui sommes-nous ?' },
  { to: '/nos-scripts', label: 'Scripts' },
  { to: '/nos-categories', label: 'Catégories' },
  { to: '/nos-ressources', label: 'Ressources' },
  { to: '/nous-contacter', label: 'Contact' },
];

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-[0_4px_24px_-12px_hsl(var(--primary)/0.25)]'
          : 'bg-transparent',
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 shadow-[var(--shadow-glow)] transition-transform group-hover:scale-105">
            <Cloud className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Scripts <span className="text-primary">Hub Tools</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  'after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-primary after:scale-x-0 after:origin-center after:transition-transform',
                  'hover:text-primary hover:after:scale-x-100',
                  isActive ? 'text-primary after:scale-x-100' : 'text-muted-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Globe className="h-4 w-4" />
                Réseaux sociaux
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Rejoignez-nous</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">TikTok</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          aria-label="Menu"
          className="lg:hidden p-2 rounded-md hover:bg-secondary/60 transition-colors"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl animate-fade-in">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-2 rounded-lg border border-border/60 bg-card/40 p-2">
              <p className="px-2 pb-1.5 text-xs font-medium text-muted-foreground">Réseaux sociaux</p>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href="https://wa.me/" target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>WhatsApp</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>TikTok</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>LinkedIn</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Instagram</a>
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
