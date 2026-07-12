import { useState, FormEvent, useRef, useCallback, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Editor, { type OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { toast } from '@/lib/toast';
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
  Settings2,
  ShieldCheck,
  BookOpenText,
  Copy,
  Wand2,
  Search,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SCRIPT_SCREENSHOTS_BUCKET } from '@/lib/scriptScreenshots';

interface CategoryLite {
  id: string;
  name: string;
}

export const DB_SCRIPT_TYPES = new Set([
  'powershell', 'bash', 'python', 'azure_cli', 'aws_cli',
  'terraform', 'bicep', 'arm', 'cloudformation', 'ansible',
  'kubernetes', 'docker', 'sql', 'javascript', 'typescript',
  'go', 'ruby', 'perl', 'yaml', 'json', 'other',
]);

export const SCRIPT_TYPES = [
  { value: 'powershell', label: 'PowerShell', monaco: 'powershell' },
  { value: 'bash', label: 'Bash / Shell', monaco: 'shell' },
  { value: 'python', label: 'Python', monaco: 'python' },
  { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { value: 'typescript', label: 'TypeScript', monaco: 'typescript' },
  { value: 'go', label: 'Go', monaco: 'go' },
  { value: 'rust', label: 'Rust', monaco: 'rust' },
  { value: 'java', label: 'Java', monaco: 'java' },
  { value: 'kotlin', label: 'Kotlin', monaco: 'kotlin' },
  { value: 'scala', label: 'Scala', monaco: 'scala' },
  { value: 'csharp', label: 'C#', monaco: 'csharp' },
  { value: 'fsharp', label: 'F#', monaco: 'fsharp' },
  { value: 'vbnet', label: 'VB.NET', monaco: 'vb' },
  { value: 'php', label: 'PHP', monaco: 'php' },
  { value: 'ruby', label: 'Ruby', monaco: 'ruby' },
  { value: 'perl', label: 'Perl', monaco: 'perl' },
  { value: 'r', label: 'R', monaco: 'r' },
  { value: 'matlab', label: 'MATLAB / Octave', monaco: 'plaintext' },
  { value: 'julia', label: 'Julia', monaco: 'julia' },
  { value: 'lua', label: 'Lua', monaco: 'lua' },
  { value: 'dart', label: 'Dart', monaco: 'dart' },
  { value: 'swift', label: 'Swift', monaco: 'swift' },
  { value: 'objective_c', label: 'Objective-C', monaco: 'objective-c' },
  { value: 'c', label: 'C', monaco: 'c' },
  { value: 'cpp', label: 'C++', monaco: 'cpp' },
  { value: 'zig', label: 'Zig', monaco: 'plaintext' },
  { value: 'nim', label: 'Nim', monaco: 'plaintext' },
  { value: 'haskell', label: 'Haskell', monaco: 'haskell' },
  { value: 'elixir', label: 'Elixir', monaco: 'elixir' },
  { value: 'erlang', label: 'Erlang', monaco: 'erlang' },
  { value: 'clojure', label: 'Clojure', monaco: 'clojure' },
  { value: 'groovy', label: 'Groovy', monaco: 'groovy' },
  { value: 'assembly', label: 'Assembly', monaco: 'plaintext' },
  { value: 'fortran', label: 'Fortran', monaco: 'plaintext' },
  { value: 'cobol', label: 'COBOL', monaco: 'plaintext' },
  { value: 'pascal', label: 'Pascal', monaco: 'pascal' },
  { value: 'ada', label: 'Ada', monaco: 'ada' },
  { value: 'sql', label: 'SQL', monaco: 'sql' },
  { value: 'plsql', label: 'PL/SQL', monaco: 'sql' },
  { value: 'tsql', label: 'T-SQL', monaco: 'sql' },
  { value: 'graphql', label: 'GraphQL', monaco: 'graphql' },
  { value: 'yaml', label: 'YAML', monaco: 'yaml' },
  { value: 'json', label: 'JSON', monaco: 'json' },
  { value: 'xml', label: 'XML', monaco: 'xml' },
  { value: 'toml', label: 'TOML', monaco: 'ini' },
  { value: 'ini', label: 'INI', monaco: 'ini' },
  { value: 'hcl', label: 'HCL', monaco: 'hcl' },
  { value: 'terraform', label: 'Terraform', monaco: 'hcl' },
  { value: 'bicep', label: 'Bicep', monaco: 'bicep' },
  { value: 'arm', label: 'ARM Template', monaco: 'json' },
  { value: 'cloudformation', label: 'CloudFormation', monaco: 'yaml' },
  { value: 'azure_cli', label: 'Azure CLI', monaco: 'shell' },
  { value: 'aws_cli', label: 'AWS CLI', monaco: 'shell' },
  { value: 'gcloud', label: 'Google Cloud CLI', monaco: 'shell' },
  { value: 'ansible', label: 'Ansible', monaco: 'yaml' },
  { value: 'kubernetes', label: 'Kubernetes', monaco: 'yaml' },
  { value: 'helm', label: 'Helm', monaco: 'yaml' },
  { value: 'docker', label: 'Dockerfile', monaco: 'dockerfile' },
  { value: 'makefile', label: 'Makefile', monaco: 'makefile' },
  { value: 'cmake', label: 'CMake', monaco: 'cmake' },
  { value: 'gradle', label: 'Gradle', monaco: 'groovy' },
  { value: 'jenkinsfile', label: 'Jenkinsfile', monaco: 'groovy' },
  { value: 'github_actions', label: 'GitHub Actions', monaco: 'yaml' },
  { value: 'gitlab_ci', label: 'GitLab CI', monaco: 'yaml' },
  { value: 'azure_devops', label: 'Azure DevOps Pipeline', monaco: 'yaml' },
  { value: 'other', label: 'Autre', monaco: 'plaintext' },
] as const;

export const LANGUAGE_OPTIONS = [
  'PowerShell', 'Bash', 'Zsh', 'Fish', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust',
  'Java', 'Kotlin', 'Scala', 'C#', 'F#', 'VB.NET', 'C', 'C++', 'Objective-C', 'Swift',
  'Dart', 'Ruby', 'Perl', 'PHP', 'R', 'MATLAB', 'Julia', 'Lua', 'Haskell', 'Elixir',
  'Erlang', 'Clojure', 'Groovy', 'Assembly', 'Fortran', 'COBOL', 'Pascal', 'Ada',
  'SQL', 'PL/SQL', 'T-SQL', 'GraphQL', 'YAML', 'JSON', 'XML', 'TOML', 'INI', 'HCL',
  'Terraform', 'Bicep', 'ARM', 'CloudFormation', 'Ansible', 'Dockerfile', 'Makefile',
  'CMake', 'Nix', 'Puppet', 'Chef', 'Helm', 'Kubernetes YAML', 'Jenkinsfile',
  'GitHub Actions YAML', 'GitLab CI YAML', 'Azure DevOps YAML', 'GDScript', 'Solidity',
  'Move', 'Vyper', 'Prolog', 'Scheme', 'Lisp', 'Delphi', 'ABAP', 'SAS', 'Stata',
  'Scratch', 'LabVIEW', 'Apex', 'Visual Basic', 'OCaml', 'Nim', 'Zig',
] as const;

const VISIBILITIES = [
  { value: 'private', label: 'Privé' },
  { value: 'public', label: 'Public' },
] as const;

const STATUSES = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
] as const;

const CRITICALITIES = [
  { value: 'low', label: 'Faible', color: 'bg-success/15 text-success' },
  { value: 'medium', label: 'Moyenne', color: 'bg-warning/15 text-warning' },
  { value: 'high', label: 'Élevée', color: 'bg-orange-500/15 text-orange-400' },
  { value: 'critical', label: 'Critique', color: 'bg-destructive/15 text-destructive' },
] as const;

const scriptSchema = z.object({
  name: z.string().trim().min(3, 'Au moins 3 caractères').max(100),
  description: z.string().trim().min(10, 'Description trop courte').max(2000),
  scriptType: z.string().min(1, 'Sélectionnez un type'),
  content: z.string().trim().min(5, 'Le contenu du script est requis'),
  criticality: z.enum(['low', 'medium', 'high', 'critical']),
  version: z.string().trim().regex(/^v?\d+(\.\d+){0,2}([-.][a-z0-9]+)?$/i, 'Format invalide (ex: 1.0.0)'),
  status: z.enum(['draft', 'active', 'inactive']),
  categoryId: z.string().min(1, 'Sélectionnez une catégorie'),
  visibility: z.enum(['private', 'public']),
  tags: z.array(z.string()).max(15, 'Maximum 15 tags'),
});

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
  file: File;
}

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="w-full h-28 flex items-center justify-center bg-muted/20 text-muted-foreground">
        <span className="text-xs">Aperçu indisponible</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="w-full h-28 object-cover"
    />
  );
}

export default function NewScriptPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const completionDisposableRef = useRef<Monaco.IDisposable | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scriptType, setScriptType] = useState<string>('');
  const [content, setContent] = useState('');
  const [criticality, setCriticality] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [version, setVersion] = useState('1.0.0');
  const [status, setStatus] = useState<'draft' | 'active' | 'inactive'>('draft');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [categoryId, setCategoryId] = useState('');
  const [license, setLicense] = useState('MIT');
  const [compatibility, setCompatibility] = useState('');
  const [dependencies, setDependencies] = useState('');
  const [languageRuntime, setLanguageRuntime] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [features, setFeatures] = useState('');
  const [usageExample, setUsageExample] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [otherInfo, setOtherInfo] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'vs'>('vs-dark');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryLite[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      const { data, error } = await supabase.from('categories').select('id, name').order('name');
      if (error) {
        toast.error(`Erreur chargement catégories: ${error.message}`);
      } else {
        setCategories((data ?? []) as CategoryLite[]);
      }
      setLoadingCategories(false);
    };
    loadCategories();
  }, []);

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

  const scriptTypeMeta = useMemo(
    () => SCRIPT_TYPES.find((l) => l.value === scriptType),
    [scriptType],
  );

  const jsonModel = useMemo(() => {
    return {
      schema_version: '1.0.0',
      script: {
        id: `script_${crypto.randomUUID().slice(0, 8)}`,
        metadata: {
          name: name || 'Nom du script',
          description: description || 'Description du script',
          category_id: categoryId || null,
          tags,
          criticality,
          status,
          visibility,
          version,
          license: license || null,
        },
        technical: {
            script_type: scriptType || 'other',
          monaco_language: scriptTypeMeta?.monaco || 'powershell',
          runtime: languageRuntime || null,
          compatibility: compatibility || null,
          dependencies: dependencies || null,
        },
        source: {
          filename: name ? `${name.toLowerCase().replace(/\s+/g, '-')}.txt` : 'untitled-script.txt',
          content: content || '# Ajoutez votre code source ici',
        },
        documentation: {
          features: features || null,
          prerequisites: prerequisites || null,
          usage_example: usageExample || null,
          details: documentation || null,
          notes: otherInfo || null,
        },
        assets: {
          screenshots: images.map((img) => ({
            name: img.name,
            size: img.size,
            preview_url: img.url,
          })),
        },
      },
      imported_at: new Date().toISOString(),
    };
  }, [
    name,
    description,
    categoryId,
    tags,
    criticality,
    status,
    visibility,
    version,
    license,
    scriptType,
    scriptTypeMeta,
    languageRuntime,
    compatibility,
    dependencies,
    content,
    features,
    prerequisites,
    usageExample,
    documentation,
    otherInfo,
    images,
  ]);

  const addTag = (val: string) => {
    const t = val.trim().toLowerCase();
    if (!t) return;
    if (tags.includes(t)) return toast.info('Ce tag existe déjà');
    if (tags.length >= 15) return toast.warning('Maximum 15 tags');
    setTags([...tags, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImgs: UploadedImage[] = [];
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith('image/')) return toast.error(`${f.name} n'est pas une image`);
      if (f.size > 5 * 1024 * 1024) return toast.error(`${f.name} dépasse 5MB`);
      newImgs.push({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
        file: f,
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

  const uploadScreenshots = async (scriptId: string) => {
    if (!images.length) return [] as string[];
    const uploadedPaths: string[] = [];
    for (const img of images) {
      const ext = img.name.split('.').pop() || 'png';
      const path = `${user?.id ?? 'anon'}/${scriptId}/${img.id}.${ext}`;
      const { error } = await supabase.storage.from(SCRIPT_SCREENSHOTS_BUCKET).upload(path, img.file, {
        upsert: true,
        cacheControl: '3600',
      });
      if (error) throw new Error(error.message);
      uploadedPaths.push(path);
    }
    return uploadedPaths;
  };

  const registerLanguageCompletion = useCallback((monaco: typeof Monaco, languageId: string) => {
    completionDisposableRef.current?.dispose();
    completionDisposableRef.current = monaco.languages.registerCompletionItemProvider(languageId, {
      provideCompletionItems: () => {
        const suggestions: Monaco.languages.CompletionItem[] = [
          {
            label: 'TODO',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '# TODO: ${1:detail}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          } as any,
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'if ${1:condition}; then\n\t${2:# code}\nfi',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          } as any,
        ];
        return { suggestions };
      },
    });
  }, []);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    const languageId = scriptTypeMeta?.monaco || 'plaintext';
    registerLanguageCompletion(monaco, languageId);
  };

  useEffect(() => {
    if (!monacoRef.current) return;
    const languageId = scriptTypeMeta?.monaco || 'plaintext';
    registerLanguageCompletion(monacoRef.current, languageId);
  }, [scriptTypeMeta, registerLanguageCompletion]);

  const runFormat = () => {
    const action = editorRef.current?.getAction('editor.action.formatDocument');
    if (!action) return;
    action.run();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = scriptSchema.safeParse({
      name,
      description,
      scriptType,
      content,
      criticality,
      version,
      status,
      categoryId,
      visibility,
      tags,
    });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }
    setErrors({});
    setSubmitting(true);
    const scriptTypeForDb = DB_SCRIPT_TYPES.has(scriptType) ? scriptType : 'other';
    const newId = crypto.randomUUID();
    let screenshotPaths: string[] = [];
    try {
      screenshotPaths = await uploadScreenshots(newId);
    } catch (err: any) {
      toast.error(`Upload screenshots: ${err?.message ?? 'erreur'}`);
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.from('scripts').insert({
      id: newId,
      name: name.trim(),
      description: description.trim(),
      script_type: scriptTypeForDb as
        | 'powershell' | 'bash' | 'python' | 'azure_cli' | 'aws_cli'
        | 'terraform' | 'bicep' | 'arm' | 'cloudformation' | 'ansible'
        | 'kubernetes' | 'docker' | 'sql' | 'javascript' | 'typescript'
        | 'go' | 'ruby' | 'perl' | 'yaml' | 'json' | 'other',
      content,
      features: features || null,
      prerequisites: prerequisites || null,
      usage_example: usageExample || null,
      screenshots: screenshotPaths,
      criticality,
      version: version.trim(),
      status,
      tags,
      category_id: categoryId || null,
      author_id: user?.id ?? null,
      license: license || null,
      language: languageRuntime || null,
      compatibility: compatibility || null,
      dependencies: dependencies || null,
      documentation: documentation || null,
      visibility,
    });
    if (error) {
      toast.error(`Erreur création script: ${error.message}`);
      setSubmitting(false);
      return;
    }
    const stored = JSON.parse(localStorage.getItem('custom_scripts') || '[]');
    stored.push(jsonModel);
    localStorage.setItem('custom_scripts', JSON.stringify(stored));
    toast.success('Script créé en base avec succès');
    navigate('/scripts');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/scripts" className="hover:text-foreground transition-colors">Scripts</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Nouveau script</span>
        </nav>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/40 bg-primary/10">
            <FileCode2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Nouveau script</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Formulaire professionnel structuré + éditeur IDE + modèle JSON complet.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="p-5 sm:p-6">
              <Accordion type="multiple" defaultValue={['identity', 'governance', 'source', 'documentation', 'assets']} className="w-full">
                <AccordionItem value="identity">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Section 1 - Identité du script</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div id="field-name" className="space-y-2">
                      <Label>Nom du script *</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="Ex: Audit complet Azure tenant" />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div id="field-description" className="space-y-2">
                      <Label>Description *</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        maxLength={2000}
                        placeholder="Objectif, contexte, valeur métier..."
                      />
                      <p className="text-[11px] text-muted-foreground text-right">{description.length}/2000</p>
                      {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div id="field-categoryId" className="space-y-2">
                        <Label>Catégorie *</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingCategories ? 'Chargement des catégories...' : 'Sélectionner...'} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
                      </div>
                      <div id="field-scriptType" className="space-y-2">
                        <Label>Type de script *</Label>
                        <Select value={scriptType} onValueChange={setScriptType}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                          <SelectContent>
                            {SCRIPT_TYPES.map((item) => (
                              <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.scriptType && <p className="text-xs text-destructive">{errors.scriptType}</p>}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="governance">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span>Section 2 - Gouvernance et métadonnées</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Version *</Label>
                        <Input value={version} onChange={(e) => setVersion(e.target.value)} className="font-mono" />
                        {errors.version && <p className="text-xs text-destructive">{errors.version}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Statut</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as 'draft' | 'active' | 'inactive')}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((v) => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Visibilité</Label>
                        <Select value={visibility} onValueChange={(v) => setVisibility(v as 'private' | 'public')}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {VISIBILITIES.map((v) => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Licence</Label>
                        <Input value={license} onChange={(e) => setLicense(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Criticité</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                        {CRITICALITIES.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setCriticality(c.value)}
                            className={cn(
                              'px-2 py-2 rounded-md text-xs font-medium border transition-all',
                              criticality === c.value ? `${c.color} border-current` : 'border-border/60 text-muted-foreground hover:border-primary/50',
                            )}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              addTag(tagInput);
                            }
                          }}
                          placeholder="azure, security, backup..."
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
                              <button type="button" onClick={() => removeTag(t)} className="ml-0.5 rounded hover:bg-destructive/20 hover:text-destructive p-0.5">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="source">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <FileCode2 className="h-4 w-4 text-primary" />
                      <span>Section 3 - Code source (éditeur IDE)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div id="field-content" className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label>Code source *</Label>
                        <div className="flex flex-wrap items-center gap-2">
                          {scriptTypeMeta && <Badge variant="outline">{scriptTypeMeta.label}</Badge>}
                          <Button type="button" size="sm" variant="outline" onClick={runFormat}>
                            <Wand2 className="h-4 w-4" /> Formater
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-xl border border-border/60 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border/60">
                          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                          <span className="ml-2 text-xs font-mono text-muted-foreground">
                            {name ? `${name.toLowerCase().replace(/\s+/g, '-')}.script` : 'untitled.script'}
                          </span>
                          <span className="ml-auto text-[11px] text-muted-foreground flex items-center gap-1">
                            <Search className="h-3 w-3" /> Ctrl+F
                          </span>
                        </div>
                        <Editor
                          value={content}
                          onChange={(value) => setContent(value ?? '')}
                          onMount={handleEditorMount}
                          language={scriptTypeMeta?.monaco || 'plaintext'}
                          theme={editorTheme}
                          height="460px"
                          options={{
                            automaticLayout: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontLigatures: true,
                            lineNumbers: 'on',
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            readOnly: false,
                            tabSize: 2,
                            insertSpaces: true,
                            wordWrap: 'on',
                            quickSuggestions: true,
                            suggestOnTriggerCharacters: true,
                            folding: true,
                            formatOnPaste: true,
                            formatOnType: true,
                            bracketPairColorization: { enabled: true },
                            guides: { bracketPairs: true },
                            find: { addExtraSpaceOnTop: false, autoFindInSelection: 'multiline' },
                          }}
                        />
                      </div>
                      {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="documentation">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <BookOpenText className="h-4 w-4 text-primary" />
                      <span>Section 4 - Documentation et exploitation</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Langage / runtime</Label>
                        <Select value={languageRuntime} onValueChange={setLanguageRuntime}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner un langage..." /></SelectTrigger>
                          <SelectContent>
                            {LANGUAGE_OPTIONS.map((lang) => (
                              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Compatibilité</Label>
                        <Input value={compatibility} onChange={(e) => setCompatibility(e.target.value)} placeholder="Linux, Windows, Azure Cloud Shell..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Dépendances</Label>
                      <Input value={dependencies} onChange={(e) => setDependencies(e.target.value)} placeholder="Az.Accounts >= 2.0, boto3, jq..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Fonctionnalités</Label>
                      <Textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Prérequis</Label>
                      <Textarea value={prerequisites} onChange={(e) => setPrerequisites(e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Exemple d'utilisation</Label>
                      <Textarea value={usageExample} onChange={(e) => setUsageExample(e.target.value)} rows={3} className="font-mono text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label>Documentation complémentaire</Label>
                      <Textarea value={documentation} onChange={(e) => setDocumentation(e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Autres informations</Label>
                      <Textarea value={otherInfo} onChange={(e) => setOtherInfo(e.target.value)} rows={3} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="assets">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-primary" />
                      <span>Section 5 - Assets & modèle JSON d'import</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
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
                          dragOver ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50 hover:bg-muted/20',
                        )}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                      >
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Glissez vos images ici, ou cliquez pour parcourir</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP - max 5MB</p>
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
                              <ImagePreview src={img.url} alt={img.name} />
                              <button
                                type="button"
                                onClick={() => removeImage(img.id)}
                                className="absolute top-1.5 right-1.5 h-7 w-7 flex items-center justify-center rounded-md bg-background/90 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Modèle JSON complet (prêt pour import automatique)</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await navigator.clipboard.writeText(JSON.stringify(jsonModel, null, 2));
                            toast.success('JSON copié');
                          }}
                        >
                          <Copy className="h-4 w-4" /> Copier JSON
                        </Button>
                      </div>
                      <Textarea value={JSON.stringify(jsonModel, null, 2)} readOnly rows={14} className="font-mono text-xs" />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="p-4 sticky top-6 space-y-3">
              <h3 className="text-sm font-semibold">Checklist formulaire pro</h3>
              <p className="text-xs text-muted-foreground">Sections: Identité, Gouvernance, Code, Documentation, JSON.</p>
              <p className="text-xs text-muted-foreground">Éditeur: coloration, autocomplétion, formatage, recherche, pliage, lignes.</p>
              <p className="text-xs text-muted-foreground">Thème auto: clair/sombre synchronisé UI.</p>
            </Card>
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={submitting} className="w-full">
                <Save className="h-4 w-4" /> {submitting ? 'Enregistrement...' : 'Enregistrer le script'}
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
