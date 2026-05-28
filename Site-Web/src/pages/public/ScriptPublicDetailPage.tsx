import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Eye, Heart, Share2, Download, Calendar, Tag, FileCode, Shield, CheckCircle2, Copy, Layers, Lock, Globe } from 'lucide-react';
import { PublicLayout } from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';
import { signScreenshotPaths } from '@/lib/scriptScreenshots';

interface Script {
  id: string; name: string; description: string | null; script_type: string;
  content: string; features: string | null; prerequisites: string | null;
  usage_example: string | null; criticality: string; tags: string[];
  version: string; license: string | null; language: string | null;
  status: string; visibility: string;
  category_id: string | null;
  compatibility: string | null;
  dependencies: string | null;
  documentation: string | null;
  screenshots: string[];
  views_count: number; likes_count: number | null; shares_count: number | null;
  downloads_count: number; created_at: string;
}

export default function ScriptPublicDetailPage() {
  const { scriptId } = useParams<{ scriptId: string }>();
  const { user } = useAuth();
  const [script, setScript] = useState<Script | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [confirmDownloadOpen, setConfirmDownloadOpen] = useState(false);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'vs'>('vs-dark');

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setEditorTheme(isDark ? 'vs-dark' : 'vs');
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const monacoLanguage = useMemo(() => {
    const t = (script?.script_type ?? '').toLowerCase();
    if (t === 'powershell') return 'powershell';
    if (t === 'bash' || t === 'aws_cli' || t === 'azure_cli') return 'shell';
    if (t === 'python') return 'python';
    if (t === 'terraform') return 'hcl';
    if (t === 'bicep') return 'bicep';
    if (t === 'arm' || t === 'json') return 'json';
    if (t === 'yaml' || t === 'kubernetes' || t === 'cloudformation') return 'yaml';
    if (t === 'sql') return 'sql';
    if (t === 'javascript') return 'javascript';
    if (t === 'typescript') return 'typescript';
    if (t === 'docker') return 'dockerfile';
    return 'plaintext';
  }, [script?.script_type]);

  useEffect(() => {
    if (!scriptId) return;
    (async () => {
      const { data } = await supabase
        .from('scripts')
        .select('id,name,description,script_type,content,features,prerequisites,usage_example,criticality,tags,version,license,language,status,visibility,category_id,compatibility,dependencies,documentation,screenshots,views_count,likes_count,shares_count,downloads_count,created_at')
        .eq('id', scriptId)
        .maybeSingle();
      if (data) {
        setScript(data as Script);
        await supabase.from('scripts').update({ views_count: (data.views_count ?? 0) + 1 }).eq('id', scriptId);
        if (data.category_id) {
          const { data: c } = await supabase.from('categories').select('name').eq('id', data.category_id).maybeSingle();
          setCategoryName((c as { name: string } | null)?.name ?? null);
        } else {
          setCategoryName(null);
        }
        const urls = await signScreenshotPaths((data as Script).screenshots ?? [], 60 * 30);
        setScreenshotUrls((urls.filter(Boolean) as string[]).slice(0, 9));
      }
      if (user) {
        const { data: l } = await supabase.from('script_likes').select('id').eq('script_id', scriptId).eq('user_id', user.id).maybeSingle();
        setLiked(!!l);
      }
      setLoading(false);
    })();
  }, [scriptId, user]);

  const toggleLike = async () => {
    if (!user) { toast.error('Connectez-vous pour aimer ce script'); return; }
    if (!script) return;
    if (liked) {
      await supabase.from('script_likes').delete().eq('script_id', script.id).eq('user_id', user.id);
      setLiked(false);
      setScript({ ...script, likes_count: Math.max(0, (script.likes_count ?? 0) - 1) });
    } else {
      const { error } = await supabase.from('script_likes').insert({ script_id: script.id, user_id: user.id });
      if (error) { toast.error(error.message); return; }
      setLiked(true);
      setScript({ ...script, likes_count: (script.likes_count ?? 0) + 1 });
    }
  };

  const share = async () => {
    if (!script) return;
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: script.name, url });
      else { await navigator.clipboard.writeText(url); toast.success('Lien copié'); }
      await supabase.from('script_shares').insert({ script_id: script.id, user_id: user?.id ?? null, channel: 'link' });
      setScript({ ...script, shares_count: (script.shares_count ?? 0) + 1 });
    } catch { /* user cancelled */ }
  };

  const download = async () => {
    if (!script) return;
    const blob = new Blob([script.content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${script.name}.${script.script_type === 'powershell' ? 'ps1' : script.script_type === 'bash' ? 'sh' : 'txt'}`;
    a.click();
    await supabase.from('scripts').update({ downloads_count: script.downloads_count + 1 }).eq('id', script.id);
    setScript({ ...script, downloads_count: script.downloads_count + 1 });
  };

  const copy = async () => { if (script) { await navigator.clipboard.writeText(script.content); toast.success('Code copié'); } };

  if (loading) return <PublicLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Chargement...</div></PublicLayout>;
  if (!script) return <PublicLayout><div className="container mx-auto px-4 py-20 text-center">
    <p className="text-muted-foreground mb-4">Script introuvable ou non public.</p>
    <Button asChild><Link to="/nos-scripts">Retour</Link></Button>
  </div></PublicLayout>;

  return (
    <PublicLayout title={script.name} description={script.description ?? undefined}>
      <section className="container mx-auto px-4 lg:px-6 py-10 max-w-6xl">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-1">
          <Link to="/nos-scripts"><ArrowLeft className="h-4 w-4" /> Retour aux scripts</Link>
        </Button>

        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/40 p-6 md:p-8 mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary" className="uppercase">{script.script_type}</Badge>
                <Badge variant="outline">{script.criticality}</Badge>
                <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" /> v{script.version}</Badge>
                {script.license && <Badge variant="outline">{script.license}</Badge>}
                {categoryName && <Badge variant="outline" className="gap-1"><Layers className="h-3 w-3" /> {categoryName}</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 truncate">{script.name}</h1>
              <p className="text-muted-foreground leading-relaxed">{script.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/40 px-2 py-1">
                  <Calendar className="h-3 w-3" /> {new Date(script.created_at).toLocaleDateString('fr-FR')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/40 px-2 py-1">
                  {script.visibility === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {script.visibility === 'public' ? 'Public' : 'Privé'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/40 px-2 py-1">
                  <FileCode className="h-3 w-3" /> {script.status}
                </span>
                {script.language && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/40 px-2 py-1">
                    Langage : {script.language}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { icon: Eye, label: 'Vues', value: script.views_count },
                  { icon: Heart, label: 'Likes', value: script.likes_count ?? 0 },
                  { icon: Share2, label: 'Partages', value: script.shares_count ?? 0 },
                  { icon: Download, label: 'Téléch.', value: script.downloads_count },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-lg border border-border/60 bg-background/40">
                    <s.icon className="h-4 w-4 text-primary mb-1" />
                    <div className="text-xl font-bold tabular-nums">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={toggleLike} variant={liked ? 'default' : 'outline'} className="gap-2">
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} /> {liked ? 'Aimé' : 'J\'aime'}
                </Button>
                <Button onClick={share} variant="outline" className="gap-2"><Share2 className="h-4 w-4" /> Partager</Button>
                <Button onClick={() => setConfirmDownloadOpen(true)} className="gap-2 shadow-[var(--shadow-glow)]"><Download className="h-4 w-4" /> Télécharger</Button>
                <Button onClick={copy} variant="outline" className="gap-2"><Copy className="h-4 w-4" /> Copier</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border/60">
                <h2 className="text-lg font-semibold flex items-center gap-2"><FileCode className="h-5 w-5 text-primary" /> Code source</h2>
                <Button size="sm" variant="outline" onClick={copy} className="gap-2">
                  <Copy className="h-4 w-4" /> Copier le code
                </Button>
              </div>
              <div className="h-[520px]">
                <Editor
                  value={script.content}
                  language={monacoLanguage}
                  theme={editorTheme}
                  options={{
                    readOnly: true,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    renderWhitespace: 'selection',
                    smoothScrolling: true,
                    padding: { top: 12, bottom: 12 },
                  }}
                />
              </div>
            </div>

            {script.features && (
              <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Fonctionnalités</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{script.features}</p>
              </div>
            )}

            {screenshotUrls.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-6">
                <h2 className="text-lg font-semibold mb-4">Captures d’écran</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {screenshotUrls.map((u) => (
                    <a key={u} href={u} target="_blank" rel="noreferrer" className="group relative rounded-lg overflow-hidden border border-border/60 bg-muted/20">
                      <img src={u} alt="Capture d’écran" loading="lazy" className="h-32 w-full object-cover transition-transform group-hover:scale-[1.02]" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {script.usage_example && (
              <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-6">
                <h2 className="text-lg font-semibold mb-3">Exemple d'utilisation</h2>
                <div className="rounded-lg border border-border/60 bg-background/60 p-4 overflow-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">{script.usage_example}</pre>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-5 space-y-3">
              <h3 className="text-sm font-semibold mb-1">Informations</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span>Type</span>
                  <span className="font-medium text-foreground">{script.script_type}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Criticité</span>
                  <span className="font-medium text-foreground">{script.criticality}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Statut</span>
                  <span className="font-medium text-foreground">{script.status}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Visibilité</span>
                  <span className="font-medium text-foreground">{script.visibility}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span>Version</span>
                  <span className="font-medium text-foreground">v{script.version}</span>
                </div>
                {script.license && (
                  <div className="flex items-center justify-between gap-3">
                    <span>Licence</span>
                    <span className="font-medium text-foreground">{script.license}</span>
                  </div>
                )}
                {script.language && (
                  <div className="flex items-center justify-between gap-3">
                    <span>Langage</span>
                    <span className="font-medium text-foreground">{script.language}</span>
                  </div>
                )}
                {categoryName && (
                  <div className="flex items-center justify-between gap-3">
                    <span>Catégorie</span>
                    <span className="font-medium text-foreground">{categoryName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <span>Date</span>
                  <span className="font-medium text-foreground">{new Date(script.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            {script.prerequisites && (
              <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-5">
                <h3 className="text-sm font-semibold mb-2">Prérequis</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{script.prerequisites}</p>
              </div>
            )}

            {(script.compatibility || script.dependencies) && (
              <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-5 space-y-3">
                <h3 className="text-sm font-semibold">Exécution</h3>
                {script.compatibility && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Compatibilité</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{script.compatibility}</p>
                  </div>
                )}
                {script.dependencies && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Dépendances</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{script.dependencies}</p>
                  </div>
                )}
              </div>
            )}

            {script.documentation && (
              <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-5">
                <h3 className="text-sm font-semibold mb-2">Documentation complémentaire</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{script.documentation}</p>
              </div>
            )}

            {(script.tags ?? []).length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-5">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /> Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {script.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>)}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      <AlertDialog open={confirmDownloadOpen} onOpenChange={setConfirmDownloadOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le téléchargement</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de télécharger <span className="font-medium text-foreground">{script.name}</span>.
              Voulez-vous continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await download();
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : 'Téléchargement impossible';
                  toast.error(msg);
                }
              }}
            >
              Télécharger
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PublicLayout>
  );
}
