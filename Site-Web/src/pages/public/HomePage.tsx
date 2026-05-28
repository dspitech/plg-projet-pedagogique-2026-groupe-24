import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Zap, Shield, Layers, Code2, Database,
  TrendingUp, FileCode, FolderOpen, BookOpen, Eye, Heart, Cloud, ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { PublicLayout } from '@/components/public/PublicLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Stat { label: string; value: number; icon: LucideIcon; hint?: string; }
interface ScriptItem { id: string; name: string; description: string | null; script_type: string; criticality: string; views_count: number; likes_count: number | null; category_id?: string | null; }
interface ResourceItem { id: string; name: string; description: string | null; resource_type: string; category_id?: string | null; }
interface CategoryItem { id: string; name: string; description: string | null; color: string; icon: string; scripts_count: number; resources_count: number; total_count: number; scripts: ScriptItem[]; resources: ResourceItem[]; }

export default function HomePage() {
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Scripts', value: 0, icon: FileCode, hint: 'Publics' },
    { label: 'Catégories', value: 0, icon: FolderOpen, hint: 'Actives' },
    { label: 'Ressources', value: 0, icon: BookOpen, hint: 'Publics' },
    { label: 'Vues totales', value: 0, icon: Eye, hint: 'Sur les scripts' },
  ]);
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: sc }, { count: cc }, { count: rc }, scr, cats, res] = await Promise.all([
        supabase.from('scripts').select('*', { count: 'exact', head: true }).eq('visibility', 'public'),
        supabase.from('categories').select('*', { count: 'exact', head: true }).eq('is_visible', true),
        supabase.from('resources').select('*', { count: 'exact', head: true }).eq('visibility', 'public'),
        supabase.from('scripts').select('id,name,description,script_type,criticality,views_count,likes_count,category_id').eq('visibility', 'public').order('created_at', { ascending: false }).limit(6),
        supabase.from('categories').select('id,name,description,color,icon').eq('is_visible', true),
        supabase.from('resources').select('id,name,description,resource_type,category_id').eq('visibility', 'public').order('created_at', { ascending: false }).limit(4),
      ]);
      const recentScripts = (scr.data ?? []) as ScriptItem[];
      const totalViews = recentScripts.reduce((a, s) => a + (s.views_count ?? 0), 0);
      setStats([
        { label: 'Scripts', value: sc ?? 0, icon: FileCode, hint: 'Publics' },
        { label: 'Catégories', value: cc ?? 0, icon: FolderOpen, hint: 'Actives' },
        { label: 'Ressources', value: rc ?? 0, icon: BookOpen, hint: 'Publics' },
        { label: 'Vues totales', value: totalViews, icon: Eye, hint: 'Sur les scripts' },
      ]);
      setScripts(recentScripts);

      const baseCats = (cats.data ?? []) as Array<{ id: string; name: string; description: string | null; color: string; icon: string }>;
      const top = await Promise.all(
        baseCats.map(async (c) => {
          const [{ count: scriptsCount }, { count: resourcesCount }, scr2, res2] = await Promise.all([
            supabase.from('scripts').select('*', { count: 'exact', head: true }).eq('category_id', c.id).eq('visibility', 'public'),
            supabase.from('resources').select('*', { count: 'exact', head: true }).eq('category_id', c.id).eq('visibility', 'public'),
            supabase.from('scripts')
              .select('id,name,description,script_type,criticality,views_count,likes_count,category_id')
              .eq('category_id', c.id).eq('visibility', 'public').order('created_at', { ascending: false }).limit(3),
            supabase.from('resources')
              .select('id,name,description,resource_type,category_id')
              .eq('category_id', c.id).eq('visibility', 'public').order('created_at', { ascending: false }).limit(2),
          ]);
          const sc2 = scriptsCount ?? 0;
          const rc2 = resourcesCount ?? 0;
          return {
            ...c,
            scripts_count: sc2,
            resources_count: rc2,
            total_count: sc2 + rc2,
            scripts: (scr2.data ?? []) as ScriptItem[],
            resources: (res2.data ?? []) as ResourceItem[],
          } satisfies CategoryItem;
        }),
      );
      setCategories(top.filter((c) => c.total_count > 0).sort((a, b) => b.total_count - a.total_count).slice(0, 6));
      setResources((res.data ?? []) as ResourceItem[]);
    })();
  }, []);

  const features = [
    { icon: Shield, title: 'Sécurité avancée', desc: 'RLS, audit logs, contrôle d\'accès basé sur les rôles.' },
    { icon: Zap, title: 'Ultra performant', desc: 'Architecture React + Supabase optimisée pour la vitesse.' },
    { icon: Layers, title: 'Scalable', desc: 'Pensé pour grandir avec vos besoins et votre équipe.' },
    { icon: Code2, title: 'Multi-langages', desc: 'PowerShell, Bash, Python, Terraform, YAML et plus.' },
    { icon: Database, title: 'Centralisé', desc: 'Tous vos scripts, catégories et ressources au même endroit.' },
    { icon: Cloud, title: 'Cloud-ready', desc: 'Déployable sur Azure, AWS et infrastructures hybrides.' },
  ];

  return (
    <PublicLayout title="Accueil" description="Scripts Hub Tools — plateforme moderne et sécurisée pour partager et gérer vos scripts Cloud, DevOps et infrastructure.">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />
        <div className="container relative mx-auto px-4 lg:px-6 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <Badge variant="outline" className="gap-1 border-primary/40 text-primary bg-primary/5">
              <Sparkles className="h-3 w-3" /> Projet Master ESTIAM
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              La plateforme moderne pour vos{' '}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent">
                scripts
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Centralisez, sécurisez et partagez vos scripts d'infrastructure dans une interface élégante,
              performante et pensée pour les équipes DevOps modernes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild size="lg" className="gap-2 shadow-[var(--shadow-glow)]">
                <Link to="/nos-scripts">Explorer les scripts <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/qui-sommes-nous">Découvrir le projet</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/70 to-card/30 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_60px_-28px_hsl(var(--primary)/0.45)] animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.16),transparent_55%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-extrabold tracking-tight tabular-nums">
                        {s.value.toLocaleString('fr-FR')}
                      </div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                    </div>
                  </div>
                  {s.hint && <div className="mt-3 text-xs text-muted-foreground">{s.hint}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 lg:px-6 py-20">
        <div className="text-center mb-12 space-y-3">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30">Fonctionnalités</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Pourquoi Scripts Hub Tools ?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une plateforme complète conçue pour répondre aux exigences professionnelles modernes.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={f.title}
              className="group relative p-6 rounded-xl border border-border/60 bg-card/40 backdrop-blur hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 mb-4 shadow-[var(--shadow-glow)]">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Scripts */}
      <section className="container mx-auto px-4 lg:px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/30">Derniers ajouts</Badge>
            <h2 className="text-3xl font-bold">Scripts récents</h2>
          </div>
          <Button asChild variant="ghost" className="gap-1">
            <Link to="/nos-scripts">Tout voir <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {scripts.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">Aucun script public pour l'instant.</p>
          )}
          {scripts.map((s, i) => (
            <Link key={s.id} to={`/nos-scripts/${s.id}`}
              className="group relative p-5 rounded-xl border border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="text-xs uppercase">{s.script_type}</Badge>
                <Badge variant="outline" className="text-xs">{s.criticality}</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">{s.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{s.description ?? 'Aucune description'}</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {s.views_count}</span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {s.likes_count ?? 0}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 lg:px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/30">Catégories</Badge>
            <h2 className="text-3xl font-bold">Catégories populaires</h2>
          </div>
          <Button asChild variant="ghost" className="gap-1">
            <Link to="/nos-categories">Tout voir <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">Aucune catégorie disponible.</p>
          )}
          {categories.map((c, i) => (
            <Link key={c.id} to={`/nos-categories/${c.id}`}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/70 to-card/30 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-[0_18px_60px_-28px_hsl(var(--primary)/0.45)] animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.16),transparent_55%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 transition-transform group-hover:scale-110"
                    style={{ background: `${c.color}22`, color: c.color }}>
                    <FolderOpen className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Contenu</div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      <Badge variant="secondary" className="text-[11px]">{c.scripts_count} scripts</Badge>
                      <Badge variant="outline" className="text-[11px]">{c.resources_count} ressources</Badge>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{c.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{c.description ?? 'Catégorie de scripts et ressources'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className="container mx-auto px-4 lg:px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/30">Ressources</Badge>
            <h2 className="text-3xl font-bold">Ressources récentes</h2>
          </div>
          <Button asChild variant="ghost" className="gap-1">
            <Link to="/nos-ressources">Tout voir <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {resources.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">Aucune ressource publique.</p>
          )}
          {resources.map((r, i) => (
            <div key={r.id}
              className="group p-5 rounded-xl border border-border/60 bg-card/40 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}>
              <Badge variant="secondary" className="text-xs uppercase mb-3">{r.resource_type}</Badge>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{r.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{r.description ?? 'Aucune description'}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 lg:px-6 py-20">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.25),transparent_50%)]" />
          <div className="relative space-y-4 max-w-2xl mx-auto">
            <TrendingUp className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold">Rejoignez la communauté CloudScripts</h2>
            <p className="text-muted-foreground">
              Accédez à l'espace administrateur pour publier et gérer vos propres scripts et ressources.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild size="lg" variant="outline">
                <Link to="/nous-contacter">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
