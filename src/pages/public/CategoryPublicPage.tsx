import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FolderOpen, Eye, Heart, Share2 } from 'lucide-react';
import { PublicLayout } from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Category { id: string; name: string; description: string | null; color: string; }
interface Script { id: string; name: string; description: string | null; script_type: string; criticality: string; views_count: number; likes_count: number | null; shares_count: number | null; }

export default function CategoryPublicPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [cat, setCat] = useState<Category | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    (async () => {
      const [{ data: c }, { data: s }] = await Promise.all([
        supabase.from('categories').select('id,name,description,color').eq('id', categoryId).maybeSingle(),
        supabase.from('scripts').select('id,name,description,script_type,criticality,views_count,likes_count,shares_count').eq('category_id', categoryId).eq('visibility', 'public').order('created_at', { ascending: false }),
      ]);
      setCat((c ?? null) as Category | null);
      setScripts((s ?? []) as Script[]);
      setLoading(false);
    })();
  }, [categoryId]);

  return (
    <PublicLayout title={cat?.name ?? 'Catégorie'} description={cat?.description ?? undefined}>
      <section className="container mx-auto px-4 lg:px-6 py-10 max-w-6xl">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-1"><Link to="/nos-categories"><ArrowLeft className="h-4 w-4" /> Toutes les catégories</Link></Button>

        {loading ? <p className="text-center text-muted-foreground py-12">Chargement...</p> : !cat ? (
          <p className="text-center text-muted-foreground py-12">Catégorie introuvable.</p>
        ) : (
          <>
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/40 p-8 mb-8 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: `${cat.color}22`, color: cat.color }}><FolderOpen className="h-7 w-7" /></div>
                <div>
                  <h1 className="text-3xl font-bold">{cat.name}</h1>
                  {cat.description && <p className="text-muted-foreground mt-1">{cat.description}</p>}
                  <Badge variant="secondary" className="mt-2">{scripts.length} script(s)</Badge>
                </div>
              </div>
            </div>

            {scripts.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Aucun script public dans cette catégorie.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {scripts.map((s, i) => (
                  <Link key={s.id} to={`/nos-scripts/${s.id}`}
                    className="group p-5 rounded-xl border border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 animate-fade-in"
                    style={{ animationDelay: `${(i % 9) * 40}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs uppercase">{s.script_type}</Badge>
                      <Badge variant="outline" className="text-xs">{s.criticality}</Badge>
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">{s.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{s.description ?? 'Aucune description'}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-border/60 text-xs text-muted-foreground">
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {s.views_count}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {s.likes_count ?? 0}</span>
                        <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {s.shares_count ?? 0}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 group-hover:text-primary" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </PublicLayout>
  );
}
