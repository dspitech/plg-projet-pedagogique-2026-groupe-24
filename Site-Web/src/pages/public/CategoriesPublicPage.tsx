import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Search, ArrowRight, Tag } from 'lucide-react';
import { PublicLayout } from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string; name: string; description: string | null; color: string;
  icon: string; type: string | null; position: number;
  scripts_count?: number;
  resources_count?: number;
  total_count?: number;
}

export default function CategoriesPublicPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('categories')
        .select('id,name,description,color,icon,type,position')
        .eq('is_visible', true).order('position');
      const cats = (data ?? []) as Category[];
      const withCounts = await Promise.all(cats.map(async (c) => {
        const [{ count: sc }, { count: rc }] = await Promise.all([
          supabase.from('scripts').select('*', { count: 'exact', head: true }).eq('category_id', c.id).eq('visibility', 'public'),
          supabase.from('resources').select('*', { count: 'exact', head: true }).eq('category_id', c.id).eq('visibility', 'public'),
        ]);
        const scripts_count = sc ?? 0;
        const resources_count = rc ?? 0;
        return { ...c, scripts_count, resources_count, total_count: scripts_count + resources_count };
      }));
      setCats(withCounts.sort((a, b) => (b.total_count ?? 0) - (a.total_count ?? 0)));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return term ? cats.filter((c) => c.name.toLowerCase().includes(term) || (c.description ?? '').toLowerCase().includes(term)) : cats;
  }, [cats, q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  return (
    <PublicLayout title="Catégories" description="Parcourez les catégories de scripts et ressources sur Scripts Hub Tools.">
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="container relative mx-auto px-4 lg:px-6 py-12 lg:py-20 text-center space-y-4 max-w-3xl animate-fade-in">
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5"><Tag className="h-3 w-3 mr-1" /> Organisation</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Nos <span className="text-primary">catégories</span></h1>
          <p className="text-muted-foreground">Trouvez rapidement les scripts adaptés à votre domaine.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-6 py-8">
        <div className="mb-8 max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une catégorie..." className="pl-9" />
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucune catégorie trouvée.</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paged.map((c, i) => (
              <Link key={c.id} to={`/nos-categories/${c.id}`}
                className="group relative p-6 rounded-xl border border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] animate-fade-in"
                style={{ animationDelay: `${(i % 9) * 50}ms` }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${c.color}22`, color: c.color }}>
                  <FolderOpen className="h-7 w-7" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{c.name}</h3>
                  <Badge variant="secondary" className="text-xs">{c.scripts_count ?? 0} scripts</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{c.description ?? 'Catégorie de scripts'}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {c.type && <span className="uppercase">{c.type}</span>}
                  <span className="text-xs text-muted-foreground">
                    {(c.resources_count ?? 0) > 0 ? `${c.resources_count} ressource(s)` : '—'}
                  </span>
                  <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">Explorer <ArrowRight className="h-3 w-3" /></span>
                </div>
              </Link>
              ))}
            </div>

            {pageCount > 1 && (
              <div className="pt-10">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                      />
                    </PaginationItem>
                    {Array.from({ length: pageCount }).slice(0, 7).map((_, idx) => {
                      const p = idx + 1;
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === currentPage}
                            onClick={(e) => { e.preventDefault(); setPage(p); }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(pageCount, p + 1)); }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Page {currentPage} / {pageCount} — {filtered.length} catégorie(s)
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </PublicLayout>
  );
}
