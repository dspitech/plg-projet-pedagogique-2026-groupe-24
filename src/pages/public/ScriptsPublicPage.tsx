import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Heart, Share2, FileCode, ArrowRight, Filter } from 'lucide-react';
import { PublicLayout } from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { supabase } from '@/integrations/supabase/client';

interface Script {
  id: string; name: string; description: string | null; script_type: string;
  criticality: string; tags: string[]; views_count: number; likes_count: number | null;
  shares_count: number | null; created_at: string; category_id: string | null;
}

export default function ScriptsPublicPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState<string>('all');
  const [crit, setCrit] = useState<string>('all');
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('scripts')
        .select('id,name,description,script_type,criticality,tags,views_count,likes_count,shares_count,created_at,category_id')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });
      setScripts((data ?? []) as Script[]);
      setLoading(false);
    })();
  }, []);

  const types = useMemo(() => Array.from(new Set(scripts.map((s) => s.script_type))), [scripts]);
  const crits = useMemo(() => Array.from(new Set(scripts.map((s) => s.criticality))), [scripts]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return scripts.filter((s) => {
      const matchQ = !term || s.name.toLowerCase().includes(term) || (s.description ?? '').toLowerCase().includes(term) || (s.tags ?? []).some((t) => t.toLowerCase().includes(term));
      const matchT = type === 'all' || s.script_type === type;
      const matchC = crit === 'all' || s.criticality === crit;
      return matchQ && matchT && matchC;
    });
  }, [scripts, q, type, crit]);

  useEffect(() => {
    setPage(1);
  }, [q, type, crit]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  return (
    <PublicLayout title="Scripts" description="Découvrez tous les scripts publics partagés sur Scripts Hub Tools.">
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="container relative mx-auto px-4 lg:px-6 py-12 lg:py-20 text-center space-y-4 max-w-3xl animate-fade-in">
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5"><FileCode className="h-3 w-3 mr-1" /> Bibliothèque</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Explorez nos <span className="text-primary">scripts</span></h1>
          <p className="text-muted-foreground">PowerShell, Bash, Python, Terraform - trouvez le script qui répond à votre besoin.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-3 mb-8 p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par nom, description ou tag..." className="pl-9" />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="lg:w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={crit} onValueChange={setCrit}>
            <SelectTrigger className="lg:w-48"><SelectValue placeholder="Criticité" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes criticités</SelectItem>
              {crits.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucun script ne correspond à votre recherche.</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paged.map((s, i) => (
              <div key={s.id}
                className="group relative p-6 rounded-xl border border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] animate-fade-in flex flex-col"
                style={{ animationDelay: `${(i % 9) * 40}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs uppercase">{s.script_type}</Badge>
                  <Badge variant="outline" className={`text-xs ${s.criticality === 'critical' ? 'border-destructive/40 text-destructive' : s.criticality === 'high' ? 'border-orange-500/40 text-orange-500' : ''}`}>{s.criticality}</Badge>
                </div>
                <Link
                  to={`/nos-scripts/${s.id}`}
                  className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                >
                  {s.name}
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{s.description ?? 'Aucune description'}</p>
                {(s.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {s.tags.slice(0, 3).map((t) => <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>)}
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-border/60">
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {s.views_count}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {s.likes_count ?? 0}</span>
                    <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {s.shares_count ?? 0}</span>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="gap-1 group-hover:text-primary">
                    <Link to={`/nos-scripts/${s.id}`}>Détails <ArrowRight className="h-3 w-3" /></Link>
                  </Button>
                </div>
              </div>
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
                  Page {currentPage} / {pageCount} — {filtered.length} résultat(s)
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </PublicLayout>
  );
}
