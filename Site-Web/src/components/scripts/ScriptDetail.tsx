import {
  ArrowLeft,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  FileCode,
  Clock,
  User,
  Star,
  Share2,
  Tag,
  Calendar,
  GitBranch,
  Cloud,
  Server,
  Shield,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Script, Criticality } from '@/data/scripts';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUserData } from '@/hooks/useUserData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ScriptDetailProps {
  script: Script;
}

const criticalityLabels: Record<Criticality, string> = {
  critical: 'Critique',
  high: 'Élevé',
  medium: 'Moyen',
  low: 'Faible',
};

const languageMap: Record<string, string> = {
  PowerShell: 'powershell',
  'Azure CLI': 'bash',
  'AWS CLI': 'bash',
  Bicep: 'typescript',
  ARM: 'json',
  Terraform: 'hcl',
  CloudFormation: 'yaml',
};

export function ScriptDetail({ script }: ScriptDetailProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const { isFavorite, toggleFavorite, addDownload, addShare, pushHistory } = useUserData();
  const fav = isFavorite(script.id);
  const ProviderIcon = script.provider === 'azure' ? Cloud : Server;

  const updatedRelative = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(script.lastUpdated), { addSuffix: true, locale: fr });
    } catch {
      return script.lastUpdated;
    }
  }, [script.lastUpdated]);

  useEffect(() => {
    pushHistory(script.id, 'view');
  }, [script.id, pushHistory]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(script.code);
    setCopied(true);
    toast.success('Code copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([script.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addDownload(script.id);
    toast.success('Script téléchargé');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: script.name, text: script.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Lien copié dans le presse-papier');
      }
    } catch {
      /* user cancelled */
    }
    addShare(script.id);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/scripts" className="hover:text-foreground transition-colors">Scripts</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          to={`/provider/${script.provider}`}
          className="hover:text-foreground transition-colors uppercase"
        >
          {script.provider}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate">{script.name}</span>
      </nav>

      {/* Header dense GitHub-like */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <ProviderIcon className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold text-foreground font-mono truncate">
                  {script.name}
                </h1>
                <span className="text-xs px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                  Public
                </span>
                {script.validated && (
                  <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20">
                    <CheckCircle2 className="h-3 w-3" />
                    Validé
                  </span>
                )}
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded border',
                    script.criticality === 'critical' && 'bg-critical/10 text-critical border-critical/20',
                    script.criticality === 'high' && 'bg-high/10 text-high border-high/20',
                    script.criticality === 'medium' && 'bg-medium/10 text-medium border-medium/20',
                    script.criticality === 'low' && 'bg-low/10 text-low border-low/20'
                  )}
                >
                  {criticalityLabels[script.criticality]}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{script.description}</p>

              {/* Inline metadata */}
              <div className="mt-3 flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3.5 w-3.5" />
                  v{script.version}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Mis à jour {updatedRelative}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {script.author}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleFavorite(script.id)}
              className={cn('gap-1.5 h-8', fav && 'text-warning border-warning/40 bg-warning/5')}
            >
              <Star className={cn('h-3.5 w-3.5', fav && 'fill-current')} />
              {fav ? 'Favori' : 'Star'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleShare} className="gap-1.5 h-8">
              <Share2 className="h-3.5 w-3.5" />
              Partager
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload} className="gap-1.5 h-8">
              <Download className="h-3.5 w-3.5" />
              Télécharger
            </Button>
            <Button size="sm" onClick={copyToClipboard} className="gap-1.5 h-8">
              {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copié!' : 'Copier'}
            </Button>
          </div>
        </div>

        {/* Tags cliquables */}
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 flex-wrap">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          {script.tags.map((tag, i) => (
            <Link
              key={i}
              to={`/scripts?search=${encodeURIComponent(tag)}`}
              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Tabs GitHub-like */}
      <Tabs defaultValue="code" className="w-full">
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-1">
          <TabsTrigger
            value="code"
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none gap-2 px-3 py-2"
          >
            <FileCode className="h-4 w-4" />
            Code
          </TabsTrigger>
          <TabsTrigger
            value="docs"
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none gap-2 px-3 py-2"
          >
            <BookOpen className="h-4 w-4" />
            Documentation
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none gap-2 px-3 py-2"
          >
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-[1fr_280px] gap-5 mt-5">
          <div className="min-w-0">
            <TabsContent value="code" className="mt-0">
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/40">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileCode className="h-3.5 w-3.5" />
                    <span className="font-mono">
                      {script.name}.{script.language === 'PowerShell' ? 'ps1' : 'sh'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground">
                      {script.language}
                    </span>
                    <span>·</span>
                    <span>{script.code.split('\n').length} lignes</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-7 gap-1.5">
                    {copied ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span className="text-xs">{copied ? 'Copié' : 'Copier'}</span>
                  </Button>
                </div>
                <div className="max-h-[600px] overflow-auto text-sm">
                  <SyntaxHighlighter
                    language={languageMap[script.language] || 'bash'}
                    style={vscDarkPlus}
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      background: 'transparent',
                      fontSize: '0.8rem',
                      padding: '1rem',
                    }}
                    lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', opacity: 0.5 }}
                  >
                    {script.code}
                  </SyntaxHighlighter>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="docs" className="mt-0 space-y-4">
              <section className="glass-card rounded-xl p-5">
                <h2 className="text-base font-semibold text-foreground mb-2">Fonction</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {script.documentation.function}
                </p>
              </section>

              <section className="glass-card rounded-xl p-5">
                <h2 className="text-base font-semibold text-foreground mb-3">Prérequis</h2>
                <ul className="space-y-2">
                  {script.documentation.prerequisites.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-success shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="glass-card rounded-xl p-5">
                <h2 className="text-base font-semibold text-foreground mb-3">Paramètres</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                        <th className="py-2 pr-3 font-medium">Nom</th>
                        <th className="py-2 pr-3 font-medium">Type</th>
                        <th className="py-2 pr-3 font-medium">Requis</th>
                        <th className="py-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {script.documentation.parameters.map((param, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-3">
                            <code className="font-mono text-primary text-xs">{param.name}</code>
                          </td>
                          <td className="py-2 pr-3">
                            <span className="text-xs px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">
                              {param.type}
                            </span>
                          </td>
                          <td className="py-2 pr-3">
                            {param.required ? (
                              <span className="text-xs text-destructive">●</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">○</span>
                            )}
                          </td>
                          <td className="py-2 text-muted-foreground">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <section className="glass-card rounded-xl p-5 border-l-4 border-warning">
                <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Consignes de Sécurité
                </h2>
                <ul className="space-y-2.5">
                  {script.documentation.security.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 mt-0.5 text-warning shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
            </TabsContent>

          </div>

          {/* Sidebar À propos */}
          <aside className="space-y-4">
            <section className="glass-card rounded-xl p-4">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">
                À propos
              </h3>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <ProviderIcon className="h-3.5 w-3.5" />
                    Provider
                  </dt>
                  <dd className="text-foreground font-medium uppercase">{script.provider}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5" />
                    Langage
                  </dt>
                  <dd className="text-foreground font-medium">{script.language}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <GitBranch className="h-3.5 w-3.5" />
                    Version
                  </dt>
                  <dd className="text-foreground font-mono text-xs">v{script.version}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Mise à jour
                  </dt>
                  <dd className="text-foreground text-xs">{script.lastUpdated}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </Tabs>
    </div>
  );
}
