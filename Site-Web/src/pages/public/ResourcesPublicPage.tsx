import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, BookOpen, Link as LinkIcon, FileText, Download, ExternalLink, Eye } from 'lucide-react';
import { PublicLayout } from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

interface Resource {
  id: string; name: string; description: string | null; resource_type: string;
  url: string | null; file_path: string | null; file_size: number | null;
  mime_type: string | null; tags: string[]; criticality: string; language: string | null;
  views_count: number; downloads_count: number; version: string; thumbnail_url: string | null;
}

const typeIcon = (t: string) => t === 'link' ? LinkIcon : t === 'document' ? FileText : BookOpen;

export default function ResourcesPublicPage() {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('resources')
        .select('id,name,description,resource_type,url,file_path,file_size,mime_type,tags,criticality,language,views_count,downloads_count,version,thumbnail_url')
        .eq('visibility', 'public').eq('status', 'active').order('created_at', { ascending: false });
      setItems((data ?? []) as Resource[]);
      setLoading(false);
    })();
  }, []);

  const types = useMemo(() => Array.from(new Set(items.map((r) => r.resource_type))), [items]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((r) => {
      const mq = !term || r.name.toLowerCase().includes(term) || (r.description ?? '').toLowerCase().includes(term) || (r.tags ?? []).some((t) => t.toLowerCase().includes(term));
      const mt = type === 'all' || r.resource_type === type;
      return mq && mt;
    });
  }, [items, q, type]);

  const open = async (r: Resource) => {
    await supabase.from('resources').update({ views_count: r.views_count + 1 }).eq('id', r.id);
    if (r.url) window.open(r.url, '_blank', 'noopener,noreferrer');
    else if (r.file_path) {
      const { data, error } = await supabase.storage.from('resources').createSignedUrl(r.file_path, 60);
      if (error) { toast.error(error.message); return; }
      window.open(data.signedUrl, '_blank');
      await supabase.from('resources').update({ downloads_count: r.downloads_count + 1 }).eq('id', r.id);
    }
  };

  return (
    <PublicLayout title="Ressources" description="Documents, liens et fichiers utiles partagés par la communauté Scripts Hub Tools.">
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="container relative mx-auto px-4 lg:px-6 py-12 lg:py-20 text-center space-y-4 max-w-3xl animate-fade-in">
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5"><BookOpen className="h-3 w-3 mr-1" /> Bibliothèque</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Nos <span className="text-primary">ressources</span></h1>
          <p className="text-muted-foreground">Documents, tutoriels, liens utiles et fichiers téléchargeables.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-3 mb-8 p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher..." className="pl-9" />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="lg:w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-1 rounded-md border border-border/60 p-1">
            <Button size="sm" variant={view === 'grid' ? 'default' : 'ghost'} onClick={() => setView('grid')}>Grille</Button>
            <Button size="sm" variant={view === 'list' ? 'default' : 'ghost'} onClick={() => setView('list')}>Liste</Button>
          </div>
        </div>

        {loading ? <p className="text-center text-muted-foreground py-12">Chargement...</p> :
          filtered.length === 0 ? <p className="text-center text-muted-foreground py-12">Aucune ressource trouvée.</p> :
          view === 'grid' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((r, i) => {
                const Icon = typeIcon(r.resource_type);
                return (
                  <div key={r.id}
                    className="group flex flex-col p-6 rounded-xl border border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] animate-fade-in"
                    style={{ animationDelay: `${(i % 9) * 40}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                      <Badge variant="outline" className="text-xs uppercase">{r.resource_type}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">{r.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{r.description ?? 'Aucune description'}</p>
                    {(r.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {r.tags.slice(0, 3).map((t) => <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>)}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-border/60">
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {r.views_count}</span>
                        <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {r.downloads_count}</span>
                      </div>
                      <Button size="sm" onClick={() => open(r)} className="gap-1">
                        {r.url ? <><ExternalLink className="h-3 w-3" /> Ouvrir</> : <><Download className="h-3 w-3" /> Télécharger</>}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => {
                const Icon = typeIcon(r.resource_type);
                return (
                  <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all animate-fade-in">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0"><Icon className="h-5 w-5" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{r.name}</h3>
                        <Badge variant="outline" className="text-xs uppercase">{r.resource_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{r.description ?? '—'}</p>
                    </div>
                    <div className="hidden md:flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {r.views_count}</span>
                      <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {r.downloads_count}</span>
                    </div>
                    <Button size="sm" onClick={() => open(r)} className="gap-1">
                      {r.url ? <ExternalLink className="h-3 w-3" /> : <Download className="h-3 w-3" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          )
        }
      </section>
    </PublicLayout>
  );
}
