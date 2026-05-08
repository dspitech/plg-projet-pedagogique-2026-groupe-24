import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileCode2,
  Loader2,
  Calendar,
  User,
  Tag,
  Shield,
  Layers3,
  BookOpenText,
  Boxes,
  Image as ImageIcon,
  History,
  FileJson,
  FileText,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { signScreenshotPaths } from '@/lib/scriptScreenshots';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Status = 'draft' | 'active' | 'inactive' | 'archived' | 'deprecated';
type Criticality = 'low' | 'medium' | 'high' | 'critical';
type Visibility = 'public' | 'private';

interface ScriptDetailData {
  id: string;
  name: string;
  description: string | null;
  script_type: string;
  content: string;
  features: string | null;
  prerequisites: string | null;
  usage_example: string | null;
  screenshots: string[];
  criticality: Criticality;
  version: string;
  status: Status;
  tags: string[];
  category_id: string | null;
  author_id: string | null;
  license: string | null;
  language: string | null;
  compatibility: string | null;
  dependencies: string | null;
  documentation: string | null;
  version_history: unknown;
  visibility: Visibility;
  created_at: string;
  updated_at: string;
}

const MONACO_LANG_MAP: Record<string, string> = {
  powershell: 'powershell',
  bash: 'bash',
  python: 'python',
  azure_cli: 'bash',
  aws_cli: 'bash',
  terraform: 'hcl',
  bicep: 'typescript',
  arm: 'json',
  cloudformation: 'yaml',
  ansible: 'yaml',
  kubernetes: 'yaml',
  docker: 'docker',
  sql: 'sql',
  javascript: 'javascript',
  typescript: 'typescript',
  go: 'go',
  ruby: 'ruby',
  perl: 'perl',
  yaml: 'yaml',
  json: 'json',
};

const toneByCriticality: Record<Criticality, string> = {
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const PDF = {
  marginX: 40,
  top: 34,
  bottom: 36,
  headerH: 24,
  bodyPad: 10,
  lineH: 6,
};

async function fetchImageAsDataUrl(url: string): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG' } | null> {
  try {
    // try fetch first (works when CORS is allowed)
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      const mime = blob.type.toLowerCase();
      const format: 'PNG' | 'JPEG' = mime.includes('png') ? 'PNG' : 'JPEG';
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('read error'));
        reader.readAsDataURL(blob);
      });
      return { dataUrl, format };
    }
    return null;
  } catch {
    return null;
  }
}

export default function ScriptDetailPage() {
  const navigate = useNavigate();
  const { scriptId } = useParams<{ scriptId: string }>();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [script, setScript] = useState<ScriptDetailData | null>(null);
  const [categoryName, setCategoryName] = useState<string>('—');
  const [authorName, setAuthorName] = useState<string>('—');
  const [signedScreenshots, setSignedScreenshots] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!scriptId) return;
      setLoading(true);
      const { data, error } = await supabase.from('scripts').select('*').eq('id', scriptId).maybeSingle();
      if (error || !data) {
        setScript(null);
        setLoading(false);
        return;
      }
      setScript(data as ScriptDetailData);
      const rawShots = (Array.isArray((data as any).screenshots) ? (data as any).screenshots : []) as string[];
      const signed = await signScreenshotPaths(rawShots, 60 * 30);
      setSignedScreenshots(signed.filter((u): u is string => Boolean(u)));
      if (data.category_id) {
        const { data: cat } = await supabase.from('categories').select('name').eq('id', data.category_id).maybeSingle();
        setCategoryName(cat?.name ?? '—');
      }
      if (data.author_id) {
        const { data: profile } = await supabase.from('profiles').select('name, email').eq('id', data.author_id).maybeSingle();
        setAuthorName(profile?.name || profile?.email || '—');
      }
      setLoading(false);
    };
    load();
  }, [scriptId]);

  const codeLanguage = useMemo(() => {
    if (!script) return 'bash';
    return MONACO_LANG_MAP[script.script_type] || 'bash';
  }, [script]);

  const handleDownloadJson = () => {
    if (!script) return;
    const payload = {
      schema_version: '1.0.0',
      script: {
        metadata: {
          id: script.id,
          name: script.name,
          description: script.description,
          category_id: script.category_id,
          category_name: categoryName,
          tags: script.tags,
          criticality: script.criticality,
          status: script.status,
          visibility: script.visibility,
          version: script.version,
          author: authorName,
          created_at: script.created_at,
          updated_at: script.updated_at,
        },
        technical: {
          script_type: script.script_type,
          language: script.language,
          compatibility: script.compatibility,
          dependencies: script.dependencies,
          license: script.license,
        },
        documentation: {
          features: script.features,
          prerequisites: script.prerequisites,
          usage_example: script.usage_example,
          details: script.documentation,
          version_history: script.version_history,
        },
        assets: {
          screenshots: script.screenshots ?? [],
          signed_screenshots: signedScreenshots,
        },
        source: {
          content: script.content,
        },
      },
    };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `${script.name}-script.json`);
    toast.success('JSON téléchargé');
  };

  const handleDownloadPdf = async () => {
    if (!script) return;
    setDownloading(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const contentW = pageW - PDF.marginX * 2;
      const maxY = pageH - PDF.bottom;
      const newPage = () => {
        doc.addPage();
        return PDF.top;
      };
      const ensureSpace = (y: number, needed: number) => (y + needed > maxY ? newPage() : y);
      const wrapBodyLines = (body: string) => {
        const text = (body || '—').replace(/\r\n/g, '\n');
        const paragraphs = text.split('\n');
        return paragraphs.flatMap((p) => {
          const parts = doc.splitTextToSize(p || ' ', contentW - PDF.bodyPad * 2);
          return parts.length ? parts : [' '];
        });
      };
      const drawSection = (yStart: number, title: string, body: string) => {
        const lines = wrapBodyLines(body);
        let idx = 0;
        let y = yStart;
        let part = 1;
        while (idx < lines.length) {
          y = ensureSpace(y, PDF.headerH + PDF.bodyPad * 2 + PDF.lineH * 3 + 10);
          const availableLines = Math.max(
            1,
            Math.floor((maxY - (y + PDF.headerH + PDF.bodyPad * 2 + 8)) / PDF.lineH),
          );
          const chunk = lines.slice(idx, idx + availableLines);
          const chunkHeight = PDF.headerH + PDF.bodyPad * 2 + chunk.length * PDF.lineH + 8;

          doc.setFillColor(245, 247, 250);
          doc.roundedRect(PDF.marginX, y, contentW, PDF.headerH, 2, 2, 'F');
          doc.setTextColor(26, 32, 44);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.text(idx === 0 ? title : `${title} (suite ${part})`, PDF.marginX + 8, y + 16);

          doc.setDrawColor(225, 230, 236);
          doc.rect(PDF.marginX, y + PDF.headerH, contentW, chunkHeight - PDF.headerH);

          doc.setTextColor(60, 66, 82);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10.5);
          doc.text(chunk, PDF.marginX + PDF.bodyPad, y + PDF.headerH + PDF.bodyPad + 3);

          y += chunkHeight + 12;
          idx += availableLines;
          part += 1;
          if (idx < lines.length) y = newPage();
        }
        return y;
      };
      const addFooterToAllPages = () => {
        const count = doc.getNumberOfPages();
        for (let i = 1; i <= count; i += 1) {
          doc.setPage(i);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(120, 130, 148);
          doc.text('Script Hub — Document technique', PDF.marginX, pageH - 14);
          doc.text(`Page ${i}/${count}`, pageW - PDF.marginX - 40, pageH - 14);
        }
      };

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, pageH, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(34);
      doc.text('Script Documentation', 52, 130);
      doc.setFontSize(24);
      doc.text(script.name, 52, 178);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(13);
      doc.setTextColor(191, 219, 254);
      doc.text(`Version ${script.version}  |  ${script.script_type}`, 52, 210);
      doc.text(`Auteur: ${authorName}`, 52, 232);
      doc.text(`Date: ${new Date().toLocaleString('fr-FR')}`, 52, 252);
      doc.setTextColor(148, 163, 184);
      doc.text('Generated by Script Hub', 52, pageH - 48);

      doc.addPage();
      let y = PDF.top;
      y = drawSection(y, 'Description', script.description || '—');
      y = drawSection(
        y,
        'Métadonnées',
        [
          `ID: ${script.id}`,
          `Catégorie: ${categoryName}`,
          `Criticité: ${script.criticality}`,
          `Statut: ${script.status}`,
          `Visibilité: ${script.visibility}`,
          `Tags: ${(script.tags || []).join(', ') || '—'}`,
          `Créé le: ${new Date(script.created_at).toLocaleString('fr-FR')}`,
          `Modifié le: ${new Date(script.updated_at).toLocaleString('fr-FR')}`,
        ].join('\n'),
      );
      y = drawSection(
        y,
        'Informations techniques',
        [
          `Type: ${script.script_type}`,
          `Langage: ${script.language || '—'}`,
          `Compatibilité: ${script.compatibility || '—'}`,
          `Licence: ${script.license || '—'}`,
        ].join('\n'),
      );
      y = drawSection(y, 'Dépendances', script.dependencies || '—');
      y = drawSection(y, 'Prérequis', script.prerequisites || '—');
      y = drawSection(y, 'Fonctionnalités', script.features || '—');
      y = drawSection(y, 'Exemples d’utilisation', script.usage_example || '—');
      y = drawSection(y, 'Documentation', script.documentation || '—');
      y = drawSection(y, 'Historique de version', JSON.stringify(script.version_history ?? {}, null, 2));

      doc.addPage();
      let codeY = PDF.top;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(26, 32, 44);
      doc.text('Code source', PDF.marginX, codeY);
      codeY += 12;
      doc.setFillColor(17, 24, 39);
      doc.roundedRect(PDF.marginX, codeY, contentW, pageH - codeY - PDF.bottom, 3, 3, 'F');
      doc.setFont('courier', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(226, 232, 240);
      const codeLines = doc.splitTextToSize(script.content || '', contentW - 16);
      const maxLinesFirstPage = Math.floor((pageH - codeY - PDF.bottom - 16) / 11);
      let lines = codeLines.slice();
      let chunk = lines.splice(0, maxLinesFirstPage);
      doc.text(chunk, PDF.marginX + 8, codeY + 18);
      while (lines.length) {
        doc.addPage();
        doc.setFillColor(17, 24, 39);
        doc.roundedRect(PDF.marginX, PDF.top, contentW, pageH - PDF.top - PDF.bottom, 3, 3, 'F');
        doc.setFont('courier', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(226, 232, 240);
        const maxLines = Math.floor((pageH - PDF.top - PDF.bottom - 16) / 11);
        chunk = lines.splice(0, maxLines);
        doc.text(chunk, PDF.marginX + 8, PDF.top + 18);
      }

      doc.addPage();
      let assetsY = PDF.top;
      assetsY = drawSection(assetsY, 'Captures d’écran', signedScreenshots.length ? 'Captures intégrées ci-dessous.' : 'Aucune capture fournie.');
      if (signedScreenshots.length) {
        const maxImgW = contentW;
        const maxImgH = 260;
        for (let i = 0; i < signedScreenshots.length; i += 1) {
          const src = signedScreenshots[i];
          const fetched = await fetchImageAsDataUrl(src);
          if (!fetched) continue;
          const yNeeded = 22 + maxImgH + 26;
          assetsY = ensureSpace(assetsY, yNeeded);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(26, 32, 44);
          doc.text(`Capture ${i + 1}`, PDF.marginX, assetsY + 12);
          doc.setDrawColor(225, 230, 236);
          doc.roundedRect(PDF.marginX, assetsY + 18, maxImgW, maxImgH, 3, 3);
          doc.addImage(fetched.dataUrl, fetched.format, PDF.marginX, assetsY + 18, maxImgW, maxImgH, undefined, 'FAST');
          assetsY += yNeeded;
        }
      }
      drawSection(assetsY, 'Auteur et version', `Auteur: ${authorName}\nVersion: ${script.version}`);

      addFooterToAllPages();

      downloadBlob(doc.output('blob'), `${script.name}.pdf`);
      toast.success('PDF téléchargé');
    } catch (error) {
      toast.error('Impossible de générer le PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[50vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!script) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <FileCode2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Script non trouvé</h2>
          <Link to="/scripts" className="text-primary hover:underline mt-2 inline-block">
            Retour à la bibliothèque
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <header className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={toneByCriticality[script.criticality]}>{script.criticality}</Badge>
                <Badge variant="outline">{script.status}</Badge>
                <Badge variant="outline">{script.visibility}</Badge>
                <Badge variant="outline">v{script.version}</Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{script.name}</h1>
              <p className="text-muted-foreground max-w-3xl">{script.description || '—'}</p>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {authorName}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Créé: {new Date(script.created_at).toLocaleString('fr-FR')}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> MAJ: {new Date(script.updated_at).toLocaleString('fr-FR')}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={downloading}>
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Télécharger
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownloadPdf}>
                    <FileText className="h-4 w-4" /> Télécharger PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadJson}>
                    <FileJson className="h-4 w-4" /> Télécharger JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card className="p-5">
              <h2 className="text-lg font-semibold mb-3 inline-flex items-center gap-2"><FileCode2 className="h-5 w-5 text-primary" /> Code source</h2>
              <div className="rounded-xl border border-border/60 overflow-hidden bg-slate-950">
                <div className="px-4 py-2 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>{script.script_type} • {script.language || 'runtime non défini'}</span>
                  <span>{script.content.split('\n').length} lignes</span>
                </div>
                <SyntaxHighlighter
                  language={codeLanguage}
                  style={vscDarkPlus}
                  showLineNumbers
                  customStyle={{ margin: 0, fontSize: '0.82rem', background: 'transparent', maxHeight: '700px' }}
                >
                  {script.content}
                </SyntaxHighlighter>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <h2 className="text-lg font-semibold inline-flex items-center gap-2"><BookOpenText className="h-5 w-5 text-primary" /> Documentation</h2>
              <Block title="Fonctionnalités" value={script.features} />
              <Block title="Prérequis" value={script.prerequisites} />
              <Block title="Exemples d’utilisation" value={script.usage_example} mono />
              <Block title="Documentation détaillée" value={script.documentation} />
            </Card>

            <Card className="p-5 space-y-4">
              <h2 className="text-lg font-semibold inline-flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Assets & captures</h2>
              {signedScreenshots.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {signedScreenshots.map((src, idx) => (
                    <a key={src + idx} href={src} target="_blank" rel="noreferrer" className="group rounded-lg border border-border/60 overflow-hidden bg-muted/20 hover:border-primary/40 transition">
                      <img src={src} alt={`Capture ${idx + 1}`} className="h-48 w-full object-cover" />
                      <div className="px-3 py-2 text-xs text-muted-foreground">Capture {idx + 1}</div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune capture associée.</p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2"><Layers3 className="h-4 w-4" /> Métadonnées</h3>
              <Meta label="Catégorie" value={categoryName} />
              <Meta label="Type script" value={script.script_type} />
              <Meta label="Langage" value={script.language || '—'} />
              <Meta label="Compatibilité" value={script.compatibility || '—'} />
              <Meta label="Licence" value={script.license || '—'} />
              <Meta label="Visibilité" value={script.visibility} />
              <Meta label="Auteur" value={authorName} />
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2"><Boxes className="h-4 w-4" /> Dépendances</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{script.dependencies || 'Aucune dépendance documentée.'}</p>
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2"><Tag className="h-4 w-4" /> Tags</h3>
              <div className="flex flex-wrap gap-2">
                {(script.tags || []).length
                  ? script.tags.map((tag) => <Badge key={tag} variant="secondary">#{tag}</Badge>)
                  : <p className="text-sm text-muted-foreground">Aucun tag.</p>}
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2"><History className="h-4 w-4" /> Historique</h3>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(script.version_history ?? {}, null, 2)}</p>
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2"><Shield className="h-4 w-4" /> Versioning</h3>
              <Meta label="Version actuelle" value={`v${script.version}`} />
              <Meta label="Création" value={new Date(script.created_at).toLocaleString('fr-FR')} />
              <Meta label="Modification" value={new Date(script.updated_at).toLocaleString('fr-FR')} />
            </Card>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function Block({ title, value, mono }: { title: string; value: string | null; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <h4 className="text-sm font-semibold mb-1">{title}</h4>
      <p className={`text-sm text-muted-foreground whitespace-pre-wrap ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</p>
    </div>
  );
}
