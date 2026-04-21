import { useState, FormEvent, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ChevronRight,
  FileCode2,
  Save,
  X,
  Upload,
  Trash2,
  Plus,
  Image as ImageIcon,
  Sparkles,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categories } from '@/data/scripts';
import { cn } from '@/lib/utils';

const LANGUAGES = ['Bash', 'PowerShell', 'Python', 'Azure CLI', 'AWS CLI', 'Bicep', 'ARM', 'Terraform', 'CloudFormation', 'JavaScript', 'TypeScript'] as const;
const CRITICALITIES = [
  { value: 'low', label: 'Faible', color: 'bg-success/15 text-success' },
  { value: 'medium', label: 'Moyenne', color: 'bg-warning/15 text-warning' },
  { value: 'high', label: 'Élevée', color: 'bg-orange-500/15 text-orange-400' },
  { value: 'critical', label: 'Critique', color: 'bg-destructive/15 text-destructive' },
] as const;

const scriptSchema = z.object({
  name: z.string().trim().min(3, 'Au moins 3 caractères').max(100),
  description: z.string().trim().min(10, 'Description trop courte').max(2000),
  language: z.string().min(1, 'Sélectionnez un type'),
  content: z.string().trim().min(5, 'Le contenu du script est requis'),
  criticality: z.enum(['low', 'medium', 'high', 'critical']),
  version: z.string().trim().regex(/^v?\d+(\.\d+){0,2}([-.][a-z0-9]+)?$/i, 'Format invalide (ex: v1.0.0)'),
  status: z.enum(['active', 'inactive']),
  category: z.string().min(1, 'Sélectionnez une catégorie'),
  tags: z.array(z.string()).max(15, 'Maximum 15 tags'),
});

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
}

export default function NewScriptPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<string>('');
  const [content, setContent] = useState('');
  const [criticality, setCriticality] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [version, setVersion] = useState('v1.0.0');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [features, setFeatures] = useState('');
  const [example, setExample] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [otherInfo, setOtherInfo] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Tags handlers
  const addTag = (val: string) => {
    const t = val.trim().toLowerCase();
    if (!t) return;
    if (tags.includes(t)) {
      toast.info('Ce tag existe déjà');
      return;
    }
    if (tags.length >= 15) {
      toast.warning('Maximum 15 tags');
      return;
    }
    setTags([...tags, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  // Images
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImgs: UploadedImage[] = [];
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} n'est pas une image`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} dépasse 5MB`);
        return;
      }
      newImgs.push({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
      });
    });
    setImages((prev) => [...prev, ...newImgs]);
  }, []);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  // Mini WYSIWYG (markdown-like) helpers
  const wrap = (before: string, after = before) => {
    const ta = descRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = description.slice(start, end);
    const newVal = description.slice(0, start) + before + selected + after + description.slice(end);
    setDescription(newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = scriptSchema.safeParse({
      name, description, language, content, criticality, version, status, category, tags,
    });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      toast.error('Veuillez corriger les erreurs du formulaire');
      // scroll to first error
      const firstField = result.error.issues[0]?.path[0] as string;
      document.getElementById(`field-${firstField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    setSubmitting(true);
    const payload = {
      ...result.data,
      features,
      example,
      prerequisites,
      otherInfo,
      imageCount: images.length,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const stored = JSON.parse(localStorage.getItem('custom_scripts') || '[]');
    stored.push(payload);
    localStorage.setItem('custom_scripts', JSON.stringify(stored));
    setTimeout(() => {
      toast.success('Script créé avec succès');
      navigate('/scripts');
    }, 400);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/scripts" className="hover:text-foreground transition-colors">Scripts</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Nouveau script</span>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/40 bg-primary/10">
            <FileCode2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Nouveau script</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Documentez et publiez un nouveau script automatisé pour vos équipes.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section: Identité */}
            <Card className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-sm uppercase tracking-wider">Identité</h2>
              </div>

              <div id="field-name" className="space-y-2">
                <Label htmlFor="s-name">Nom du script <span className="text-destructive">*</span></Label>
                <Input
                  id="s-name"
                  placeholder="Ex: Création automatique d'un Resource Group"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div id="field-description" className="space-y-2">
                <Label htmlFor="s-desc">Description <span className="text-destructive">*</span></Label>
                <div className="rounded-md border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                  <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/60 bg-muted/30">
                    <button type="button" onClick={() => wrap('**')} className="p-1.5 rounded hover:bg-accent" title="Gras"><Bold className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => wrap('*')} className="p-1.5 rounded hover:bg-accent" title="Italique"><Italic className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => wrap('\n- ', '')} className="p-1.5 rounded hover:bg-accent" title="Liste"><List className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => wrap('[', '](url)')} className="p-1.5 rounded hover:bg-accent" title="Lien"><LinkIcon className="h-3.5 w-3.5" /></button>
                    <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">{description.length}/2000</span>
                  </div>
                  <Textarea
                    id="s-desc"
                    ref={descRef}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez ce que fait le script, son contexte d'utilisation, ses bénéfices..."
                    rows={6}
                    maxLength={2000}
                    className="border-0 focus-visible:ring-0 rounded-none"
                  />
                </div>
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div id="field-category" className="space-y-2">
                  <Label>Catégorie <span className="text-destructive">*</span></Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger aria-invalid={!!errors.category}>
                      <SelectValue placeholder="Sélectionner…" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                </div>

                <div id="field-language" className="space-y-2">
                  <Label>Type de script <span className="text-destructive">*</span></Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger aria-invalid={!!errors.language}>
                      <SelectValue placeholder="Sélectionner…" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.language && <p className="text-xs text-destructive">{errors.language}</p>}
                </div>
              </div>
            </Card>

            {/* Section: Code */}
            <Card className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <FileCode2 className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-sm uppercase tracking-wider">Code source</h2>
              </div>

              <div id="field-content" className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="s-content">Contenu du script <span className="text-destructive">*</span></Label>
                  {language && (
                    <Badge variant="outline" className="font-mono text-[10px]">{language}</Badge>
                  )}
                </div>
                <div className="rounded-md border border-border/60 bg-[hsl(222_47%_4%)] overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/60 bg-muted/20">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                    <span className="ml-3 text-[11px] font-mono text-muted-foreground">
                      {name ? `${name.toLowerCase().replace(/\s+/g, '-')}.${language === 'PowerShell' ? 'ps1' : language === 'Python' ? 'py' : 'sh'}` : 'untitled'}
                    </span>
                  </div>
                  <Textarea
                    id="s-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`# Votre code ${language || ''} ici…\n`}
                    rows={14}
                    spellCheck={false}
                    className="border-0 focus-visible:ring-0 rounded-none font-mono text-sm bg-transparent text-foreground/90 leading-relaxed"
                  />
                </div>
                {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
              </div>
            </Card>

            {/* Section: Sections additionnelles */}
            <Card className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Plus className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-sm uppercase tracking-wider">Documentation détaillée</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-features">Fonctionnalités</Label>
                <Textarea
                  id="s-features"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="- Crée le RG&#10;- Vérifie l'existence&#10;- Tag automatique"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-prereq">Prérequis</Label>
                <Textarea
                  id="s-prereq"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  placeholder="Ex: Azure CLI ≥ 2.50, droits Contributor sur la subscription…"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-example">Exemple d'utilisation</Label>
                <Textarea
                  id="s-example"
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  placeholder="./script.sh --name myRG --location francecentral"
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-other">Autres informations</Label>
                <Textarea
                  id="s-other"
                  value={otherInfo}
                  onChange={(e) => setOtherInfo(e.target.value)}
                  placeholder="Notes, limitations, références…"
                  rows={3}
                />
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label>Captures d'écran</Label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  className={cn(
                    'rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
                    dragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-border/60 hover:border-primary/50 hover:bg-muted/20'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Glissez vos images ici, ou cliquez pour parcourir</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP — max 5MB par fichier</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {images.map((img) => (
                      <div key={img.id} className="group relative rounded-lg border border-border/60 overflow-hidden bg-muted/20">
                        <img src={img.url} alt={img.name} className="w-full h-28 object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1.5 right-1.5 h-7 w-7 flex items-center justify-center rounded-md bg-background/90 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Supprimer ${img.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="px-2 py-1.5 text-[10px] truncate text-muted-foreground bg-background/60 flex items-center gap-1">
                          <ImageIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{img.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <Card className="p-5 space-y-5 sticky top-6">
              <h3 className="font-semibold text-sm uppercase tracking-wider pb-2 border-b border-border/60">
                Métadonnées
              </h3>

              <div id="field-criticality" className="space-y-2">
                <Label>Criticité</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CRITICALITIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCriticality(c.value)}
                      className={cn(
                        'px-2 py-2 rounded-md text-xs font-medium border transition-all',
                        criticality === c.value
                          ? `${c.color} border-current`
                          : 'border-border/60 text-muted-foreground hover:border-primary/50'
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div id="field-version" className="space-y-2">
                <Label htmlFor="s-version">Version</Label>
                <Input
                  id="s-version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0.0"
                  className="font-mono"
                  aria-invalid={!!errors.version}
                />
                {errors.version && <p className="text-xs text-destructive">{errors.version}</p>}
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success" />Actif</span>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-muted-foreground" />Inactif</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="s-tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    placeholder="azure, network…"
                  />
                  <Button type="button" size="icon" variant="outline" onClick={() => addTag(tagInput)} aria-label="Ajouter le tag">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="gap-1 pr-1">
                        {t}
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          className="ml-0.5 rounded hover:bg-destructive/20 hover:text-destructive p-0.5"
                          aria-label={`Retirer ${t}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">Entrée ou virgule pour ajouter</p>
              </div>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={submitting} className="w-full">
                <Save className="h-4 w-4" /> {submitting ? 'Enregistrement…' : 'Enregistrer le script'}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/scripts')}>
                <X className="h-4 w-4" /> Annuler
              </Button>
            </div>
          </aside>
        </form>
      </div>
    </DashboardLayout>
  );
}
