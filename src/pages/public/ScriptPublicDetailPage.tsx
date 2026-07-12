import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft, Eye, Heart, Share2, Download, Calendar, Tag, FileCode, Shield, CheckCircle2,
  Copy, Layers, Lock, Globe, Maximize2, Minimize2, Sun, Moon, ChevronRight, BookOpen,
  Cpu, Package, ListChecks, Sparkles, Info, History, ScrollText, AlertTriangle, Hash,
} from 'lucide-react';
import { PublicLayout } from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';
import { signScreenshotPaths } from '@/lib/scriptScreenshots';
import { cn } from '@/lib/utils';
import { useGuest, type GuestIdentity } from '@/hooks/useGuest';
import { GuestPseudoDialog } from '@/components/public/GuestPseudoDialog';

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
  is_validated: boolean | null;
  views_count: number; likes_count: number | null; shares_count: number | null;
  downloads_count: number; favorites_count: number | null;
  average_rating: number | null;
  version_history: Array<{ version?: string; date?: string; changes?: string }> | null;
  created_at: string; updated_at: string;
}

const criticalityStyles: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
  high: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  medium: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
};

const extByType: Record<string, string> = {
  powershell: 'ps1', bash: 'sh', python: 'py', terraform: 'tf', bicep: 'bicep',
  arm: 'json', json: 'json', yaml: 'yml', kubernetes: 'yaml', cloudformation: 'yaml',
  sql: 'sql', javascript: 'js', typescript: 'ts', docker: 'Dockerfile', aws_cli: 'sh', azure_cli: 'sh',
};

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
  const [fullscreen, setFullscreen] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const { guest } = useGuest();
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'like' | 'share' | null>(null);

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

  const fileExtension = useMemo(() => extByType[(script?.script_type ?? '').toLowerCase()] ?? 'txt', [script?.script_type]);
  const lineCount = useMemo(() => script?.content?.split('\n').length ?? 0, [script?.content]);
  const charCount = useMemo(() => script?.content?.length ?? 0, [script?.content]);
  const sizeKB = useMemo(() => (charCount / 1024).toFixed(1), [charCount]);

  useEffect(() => {
    if (!scriptId) return;
    (async () => {
      const { data } = await supabase
        .from('scripts')
        .select('id,name,description,script_type,content,features,prerequisites,usage_example,criticality,tags,version,license,language,status,visibility,category_id,compatibility,dependencies,documentation,screenshots,is_validated,views_count,likes_count,shares_count,downloads_count,favorites_count,average_rating,version_history,created_at,updated_at')
        .eq('id', scriptId)
        .maybeSingle();
      if (data) {
        setScript(data as Script);
        await supabase.rpc('increment_script_views', { _script_id: scriptId });
        if (data.category_id) {
          const { data: c } = await supabase.from('categories').select('name').eq('id', data.category_id).maybeSingle();
          setCategoryName((c as { name: string } | null)?.name ?? null);
        }
        const urls = await signScreenshotPaths((data as Script).screenshots ?? [], 60 * 30);
        setScreenshotUrls((urls.filter(Boolean) as string[]).slice(0, 9));
      }
      if (user) {
        const { data: l } = await supabase.from('script_likes').select('id').eq('script_id', scriptId).eq('user_id', user.id).maybeSingle();
        setLiked(!!l);
      } else if (guest) {
        const { data: l } = await supabase.from('script_likes').select('id').eq('script_id', scriptId).eq('guest_id', guest.id).maybeSingle();
        setLiked(!!l);
      }
      setLoading(false);
    })();
  }, [scriptId, user, guest]);

  const performLike = async (identity: { user?: string; guest?: string }) => {
    if (!script) return;
    if (liked) {
      const q = supabase.from('script_likes').delete().eq('script_id', script.id);
      const { error } = identity.user
        ? await q.eq('user_id', identity.user)
        : await q.eq('guest_id', identity.guest!);
      if (error) { toast.error(error.message); return; }
      setLiked(false);
      setScript({ ...script, likes_count: Math.max(0, (script.likes_count ?? 0) - 1) });
    } else {
      const payload: { script_id: string; user_id?: string; guest_id?: string } = identity.user
        ? { script_id: script.id, user_id: identity.user }
        : { script_id: script.id, guest_id: identity.guest! };
      const { error } = await supabase.from('script_likes').insert(payload as never);
      if (error) { toast.error(error.message); return; }
      setLiked(true);
      setScript({ ...script, likes_count: (script.likes_count ?? 0) + 1 });
    }
  };

  const toggleLike = async () => {
    if (user) return performLike({ user: user.id });
    if (guest) return performLike({ guest: guest.id });
    setPendingAction('like');
    setGuestDialogOpen(true);
  };

  const performShare = async (identity: { user?: string | null; guest?: string | null }) => {
    if (!script) return;
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: script.name, url });
      else { await navigator.clipboard.writeText(url); toast.success('Lien copié'); }
      await supabase.from('script_shares').insert({
        script_id: script.id,
        user_id: identity.user ?? null,
        guest_id: identity.guest ?? null,
        channel: 'link',
      });
      setScript({ ...script, shares_count: (script.shares_count ?? 0) + 1 });
    } catch { /* cancelled */ }
  };

  const share = async () => {
    if (user) return performShare({ user: user.id });
    if (guest) return performShare({ guest: guest.id });
    setPendingAction('share');
    setGuestDialogOpen(true);
  };

  const onGuestRegistered = async (g: GuestIdentity) => {
    if (pendingAction === 'like') await performLike({ guest: g.id });
    else if (pendingAction === 'share') await performShare({ guest: g.id });
    setPendingAction(null);
  };

  const download = async () => {
    if (!script) return;
    const blob = new Blob([script.content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${script.name}.${fileExtension}`;
    a.click();
    await supabase.from('scripts').update({ downloads_count: script.downloads_count + 1 }).eq('id', script.id);
    setScript({ ...script, downloads_count: script.downloads_count + 1 });
    toast.success('Téléchargement lancé');
  };

  const copy = async () => { if (script) { await navigator.clipboard.writeText(script.content); toast.success('Code copié'); } };

  if (loading) return <PublicLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Chargement...</div></PublicLayout>;
  if (!script) return <PublicLayout><div className="container mx-auto px-4 py-20 text-center">
    <p className="text-muted-foreground mb-4">Script introuvable ou non public.</p>
    <Button asChild><Link to="/nos-scripts">Retour</Link></Button>
  </div></PublicLayout>;

  const versionHistory = Array.isArray(script.version_history) ? script.version_history : [];

  return (
    <PublicLayout title={script.name} description={script.description ?? undefined}>
      <section className="container mx-auto px-4 lg:px-6 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/nos-scripts" className="hover:text-foreground transition-colors">Scripts</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {categoryName && (
            <>
              <Link to={`/nos-categories/${script.category_id}`} className="hover:text-foreground transition-colors">{categoryName}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
          <span className="text-foreground font-medium truncate">{script.name}</span>
        </nav>

        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card/60 to-card/30 p-6 md:p-8 mb-6 animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
          <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary" className="uppercase font-mono text-xs">{script.script_type}</Badge>
                <Badge className={cn('border', criticalityStyles[script.criticality] ?? '')}>
                  <AlertTriangle className="h-3 w-3 mr-1" /> {script.criticality}
                </Badge>
                <Badge variant="outline" className="gap-1"><Hash className="h-3 w-3" /> v{script.version}</Badge>
                {script.is_validated && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Validé
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  {script.visibility === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {script.visibility}
                </Badge>
                {script.license && <Badge variant="outline">{script.license}</Badge>}
                {categoryName && <Badge variant="outline" className="gap-1"><Layers className="h-3 w-3" /> {categoryName}</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 leading-tight">{script.name}</h1>
              {script.description && (
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg max-w-3xl">{script.description}</p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1">
                  <Calendar className="h-3 w-3" /> Créé le {new Date(script.created_at).toLocaleDateString('fr-FR')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1">
                  <History className="h-3 w-3" /> Mis à jour le {new Date(script.updated_at).toLocaleDateString('fr-FR')}
                </span>
                {script.language && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1">
                    <Cpu className="h-3 w-3" /> {script.language}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1">
                  <FileCode className="h-3 w-3" /> {lineCount} lignes · {sizeKB} Ko
                </span>
              </div>
            </div>

            {/* Actions + stats */}
            <div className="w-full lg:w-[340px] shrink-0 space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: Eye, label: 'Vues', value: script.views_count },
                  { icon: Heart, label: 'Likes', value: script.likes_count ?? 0 },
                  { icon: Share2, label: 'Part.', value: script.shares_count ?? 0 },
                  { icon: Download, label: 'Tél.', value: script.downloads_count },
                ].map((s) => (
                  <div key={s.label} className="p-2.5 rounded-lg border border-border/60 bg-background/60 text-center">
                    <s.icon className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
                    <div className="text-base font-bold tabular-nums leading-none">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={toggleLike} variant={liked ? 'default' : 'outline'} className="gap-2" size="sm">
                  <Heart className={cn('h-4 w-4', liked && 'fill-current')} /> {liked ? 'Aimé' : "J'aime"}
                </Button>
                <Button onClick={share} variant="outline" className="gap-2" size="sm">
                  <Share2 className="h-4 w-4" /> Partager
                </Button>
                <Button onClick={copy} variant="outline" className="gap-2" size="sm">
                  <Copy className="h-4 w-4" /> Copier
                </Button>
                <Button onClick={() => setConfirmDownloadOpen(true)} className="gap-2 shadow-[var(--shadow-glow)]" size="sm">
                  <Download className="h-4 w-4" /> Télécharger
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* LEFT — Editor + tabs */}
          <div className="min-w-0 space-y-6">
            {/* PRO EDITOR */}
            <div
              ref={editorWrapRef}
              className={cn(
                'rounded-xl border border-border/60 bg-[#1e1e1e] overflow-hidden shadow-2xl transition-all',
                fullscreen && 'fixed inset-0 z-50 rounded-none'
              )}
            >
              {/* Editor header — VSCode style */}
              <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/60 bg-gradient-to-r from-zinc-900 to-zinc-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-950/60 border border-zinc-700/50 text-xs text-zinc-300 font-mono truncate">
                    <FileCode className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{script.name}.{fileExtension}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase border-zinc-700 text-zinc-400 hidden sm:inline-flex">
                    {monacoLanguage}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setWordWrap((w) => !w)}
                    className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50" title="Retour à la ligne">
                    <ScrollText className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost"
                    onClick={() => setEditorTheme((t) => (t === 'vs-dark' ? 'vs' : 'vs-dark'))}
                    className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50" title="Changer le thème">
                    {editorTheme === 'vs-dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={copy}
                    className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50" title="Copier">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setFullscreen((f) => !f)}
                    className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50" title="Plein écran">
                    {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              <div className={cn('transition-all', fullscreen ? 'h-[calc(100vh-72px)]' : 'h-[560px]')}>
                <Editor
                  value={script.content}
                  language={monacoLanguage}
                  theme={editorTheme}
                  options={{
                    readOnly: true,
                    automaticLayout: true,
                    minimap: { enabled: !fullscreen ? false : true },
                    fontSize: 13,
                    fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace',
                    fontLigatures: true,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: wordWrap ? 'on' : 'off',
                    renderWhitespace: 'selection',
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    bracketPairColorization: { enabled: true },
                    padding: { top: 16, bottom: 16 },
                    scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
                  }}
                />
              </div>

              {/* Status bar — VSCode style */}
              <div className="flex items-center justify-between gap-3 px-4 py-1.5 border-t border-border/60 bg-primary text-primary-foreground text-[11px] font-medium">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Lecture seule</span>
                  <span className="hidden sm:inline">UTF-8</span>
                  <span className="hidden sm:inline uppercase">{monacoLanguage}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>{lineCount} lignes</span>
                  <span className="hidden sm:inline">{charCount.toLocaleString('fr-FR')} caractères</span>
                  <span className="hidden md:inline">{sizeKB} Ko</span>
                </div>
              </div>
            </div>

            {/* TABS — documentation */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-card/40 border border-border/60 p-1 h-auto flex-wrap">
                <TabsTrigger value="overview" className="gap-2"><Info className="h-3.5 w-3.5" /> Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="features" className="gap-2"><Sparkles className="h-3.5 w-3.5" /> Fonctionnalités</TabsTrigger>
                <TabsTrigger value="prerequisites" className="gap-2"><ListChecks className="h-3.5 w-3.5" /> Prérequis</TabsTrigger>
                <TabsTrigger value="usage" className="gap-2"><FileCode className="h-3.5 w-3.5" /> Utilisation</TabsTrigger>
                <TabsTrigger value="docs" className="gap-2"><BookOpen className="h-3.5 w-3.5" /> Documentation</TabsTrigger>
                <TabsTrigger value="history" className="gap-2"><History className="h-3.5 w-3.5" /> Historique</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-4">
                <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-6">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" /> À propos de ce script
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {script.description ?? 'Aucune description fournie pour ce script.'}
                  </p>
                  {(script.compatibility || script.dependencies) && (
                    <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/60">
                      {script.compatibility && (
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Cpu className="h-3.5 w-3.5 text-primary" /> Compatibilité
                          </h3>
                          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{script.compatibility}</p>
                        </div>
                      )}
                      {script.dependencies && (
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5 text-primary" /> Dépendances
                          </h3>
                          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{script.dependencies}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {screenshotUrls.length > 0 && (
                  <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-6">
                    <h2 className="text-lg font-semibold mb-4">Captures d'écran</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {screenshotUrls.map((u) => (
                        <a key={u} href={u} target="_blank" rel="noreferrer"
                          className="group relative rounded-lg overflow-hidden border border-border/60 bg-muted/20">
                          <img src={u} alt="Capture d'écran" loading="lazy"
                            className="h-40 w-full object-cover transition-transform group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="features" className="mt-4">
                <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-6">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> Fonctionnalités principales
                  </h2>
                  {script.features ? (
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{script.features}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Aucune fonctionnalité documentée.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="prerequisites" className="mt-4">
                <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-6">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-primary" /> Prérequis & dépendances
                  </h2>
                  {script.prerequisites ? (
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{script.prerequisites}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Aucun prérequis spécifique mentionné.</p>
                  )}
                  {script.dependencies && (
                    <div className="mt-5 pt-5 border-t border-border/60">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-primary" /> Modules / packages requis
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{script.dependencies}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="usage" className="mt-4">
                <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-6">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" /> Exemple d'utilisation
                  </h2>
                  {script.usage_example ? (
                    <div className="rounded-lg border border-border/60 bg-zinc-950 p-4 overflow-auto">
                      <pre className="text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">{script.usage_example}</pre>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Aucun exemple d'utilisation fourni.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="docs" className="mt-4">
                <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-6">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" /> Documentation complémentaire
                  </h2>
                  {script.documentation ? (
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{script.documentation}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Aucune documentation supplémentaire.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" /> Historique des versions
                  </h2>
                  {versionHistory.length > 0 ? (
                    <ol className="relative border-l border-border/60 pl-6 space-y-5">
                      {versionHistory.map((v, i) => (
                        <li key={i} className="relative">
                          <span className="absolute -left-[27px] top-1 flex h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                          <div className="flex items-baseline gap-3 mb-1">
                            <Badge variant="outline" className="font-mono">v{v.version ?? '?'}</Badge>
                            {v.date && <span className="text-xs text-muted-foreground">{v.date}</span>}
                          </div>
                          {v.changes && <p className="text-sm text-muted-foreground whitespace-pre-line">{v.changes}</p>}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      Version actuelle : <span className="font-mono text-foreground">v{script.version}</span> — aucun historique disponible.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT — Aside */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Détails techniques</h3>
              <dl className="space-y-3 text-sm">
                {[
                  ['Type', script.script_type],
                  ['Langage', script.language ?? '—'],
                  ['Version', `v${script.version}`],
                  ['Criticité', script.criticality],
                  ['Statut', script.status],
                  ['Visibilité', script.visibility],
                  ['Licence', script.license ?? '—'],
                  ['Catégorie', categoryName ?? '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium text-foreground text-right truncate max-w-[60%]">{v}</dd>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Créé le</dt>
                  <dd className="font-medium text-foreground">{new Date(script.created_at).toLocaleDateString('fr-FR')}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Modifié le</dt>
                  <dd className="font-medium text-foreground">{new Date(script.updated_at).toLocaleDateString('fr-FR')}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Engagement</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Eye className="h-4 w-4" /> Vues</span><span className="font-semibold tabular-nums">{script.views_count}</span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Heart className="h-4 w-4" /> Likes</span><span className="font-semibold tabular-nums">{script.likes_count ?? 0}</span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Share2 className="h-4 w-4" /> Partages</span><span className="font-semibold tabular-nums">{script.shares_count ?? 0}</span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Download className="h-4 w-4" /> Téléch.</span><span className="font-semibold tabular-nums">{script.downloads_count}</span></div>
              </div>
            </div>

            {(script.tags ?? []).length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-primary" /> Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {script.tags.map((t) => (
                    <Link key={t} to={`/nos-scripts?search=${encodeURIComponent(t)}`}>
                      <Badge variant="outline" className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors">#{t}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5">
              <Shield className="h-5 w-5 text-primary mb-2" />
              <h3 className="text-sm font-semibold mb-1">Avertissement de sécurité</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Testez toujours ce script dans un environnement isolé avant tout déploiement
                en production. Vérifiez les permissions et la conformité avec vos politiques internes.
              </p>
            </div>

            <Button asChild variant="outline" className="w-full gap-2">
              <Link to="/nos-scripts"><ArrowLeft className="h-4 w-4" /> Retour au catalogue</Link>
            </Button>
          </aside>
        </div>
      </section>

      <AlertDialog open={confirmDownloadOpen} onOpenChange={setConfirmDownloadOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le téléchargement</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de télécharger <span className="font-medium text-foreground">{script.name}.{fileExtension}</span> ({sizeKB} Ko).
              Pensez à vérifier le code avant exécution dans votre environnement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              try { await download(); } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : 'Téléchargement impossible');
              }
            }}>Télécharger</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GuestPseudoDialog
        open={guestDialogOpen}
        onOpenChange={(o) => { setGuestDialogOpen(o); if (!o) setPendingAction(null); }}
        onRegistered={onGuestRegistered}
        reason={pendingAction === 'like'
          ? "Pour aimer ce script sans créer de compte, choisissez un pseudo unique."
          : pendingAction === 'share'
            ? "Pour partager sans créer de compte, choisissez un pseudo unique."
            : undefined}
      />
    </PublicLayout>
  );
}
