import { useEffect, useMemo, useState, FormEvent, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, LayoutGrid, Table2, Library, Loader2, Edit3, Trash2, Eye, EyeOff,
  ExternalLink, Link as LinkIcon, FileText, FileArchive, Video, Image as ImageIcon,
  Github, Sparkles, Download, Upload, Archive, AlertTriangle, CheckCircle2, XCircle,
  Star, Filter, X, ChevronLeft, ChevronRight, FileDown, FileJson,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';

type ResourceType = 'link' | 'document' | 'file' | 'video' | 'image' | 'repository' | 'other';
type ResStatus = 'active' | 'archived' | 'draft';
type ResVisibility = 'public' | 'private';
type ResCriticality = 'low' | 'medium' | 'high' | 'critical';

interface ResourceRow {
  id: string;
  name: string;
  description: string | null;
  resource_type: ResourceType;
  url: string | null;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  category_id: string | null;
  tags: string[];
  visibility: ResVisibility;
  status: ResStatus;
  criticality: ResCriticality;
  language: string | null;
  author_id: string | null;
  views_count: number;
  downloads_count: number;
  favorites_count: number;
  version: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryLite { id: string; name: string; color: string; }

const TYPE_META: Record<ResourceType, { label: string; icon: typeof LinkIcon; cls: string }> = {
  link:       { label: 'Lien',       icon: LinkIcon,    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  document:   { label: 'Document',   icon: FileText,    cls: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  file:       { label: 'Fichier',    icon: FileArchive, cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  video:      { label: 'Vidéo',      icon: Video,       cls: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  image:      { label: 'Image',      icon: ImageIcon,   cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  repository: { label: 'Dépôt',      icon: Github,      cls: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
  other:      { label: 'Autre',      icon: Sparkles,    cls: 'bg-muted text-muted-foreground border-border' },
};

const STATUS_META: Record<ResStatus, { label: string; cls: string }> = {
  active:   { label: 'Actif',    cls: 'bg-success/10 text-success border-success/30' },
  draft:    { label: 'Brouillon',cls: 'bg-muted text-muted-foreground border-border' },
  archived: { label: 'Archivé',  cls: 'bg-warning/10 text-warning border-warning/30' },
};

const CRIT_META: Record<ResCriticality, { label: string; cls: string }> = {
  low:      { label: 'Faible',   cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  medium:   { label: 'Moyenne',  cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  high:     { label: 'Élevée',   cls: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  critical: { label: 'Critique', cls: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const PAGE_SIZE = 12;
const STORAGE_KEY = 'resources_filters_v1';

const emptyForm = {
  name: '',
  description: '',
  resource_type: 'link' as ResourceType,
  url: '',
  category_id: '',
  tags: '',
  visibility: 'public' as ResVisibility,
  status: 'active' as ResStatus,
  criticality: 'medium' as ResCriticality,
  language: '',
  version: '1.0.0',
  is_featured: false,
};

function formatBytes(n: number | null) {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResourcesPage() {
  const { user, hasRole, hasPermission } = useAuth();
  const canCreate = hasRole('global_admin') || hasRole('admin') || hasRole('editor');

  const [items, setItems] = useState<ResourceRow[]>([]);
  const [categories, setCategories] = useState<CategoryLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);

  // Filters
  const [query, setQuery] = useState('');
  const [fType, setFType] = useState<string>('all');
  const [fStatus, setFStatus] = useState<string>('all');
  const [fVisibility, setFVisibility] = useState<string>('all');
  const [fCriticality, setFCriticality] = useState<string>('all');
  const [fCategory, setFCategory] = useState<string>('all');

  // Bulk
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Dialog
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ResourceRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ResourceRow | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<null | 'delete' | 'archive'>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: c }] = await Promise.all([
      supabase.from('resources').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('id,name,color').order('name'),
    ]);
    setItems((r ?? []) as ResourceRow[]);
    setCategories((c ?? []) as CategoryLite[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Restore filters
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setQuery(s.query ?? '');
        setFType(s.fType ?? 'all');
        setFStatus(s.fStatus ?? 'all');
        setFVisibility(s.fVisibility ?? 'all');
        setFCriticality(s.fCriticality ?? 'all');
        setFCategory(s.fCategory ?? 'all');
      }
    } catch { /* noop */ }
  }, []);

  const saveFilters = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      query, fType, fStatus, fVisibility, fCriticality, fCategory,
    }));
    toast.success('Filtres sauvegardés');
  };
  const resetFilters = () => {
    setQuery(''); setFType('all'); setFStatus('all'); setFVisibility('all');
    setFCriticality('all'); setFCategory('all');
    localStorage.removeItem(STORAGE_KEY);
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter(r => {
      if (fType !== 'all' && r.resource_type !== fType) return false;
      if (fStatus !== 'all' && r.status !== fStatus) return false;
      if (fVisibility !== 'all' && r.visibility !== fVisibility) return false;
      if (fCriticality !== 'all' && r.criticality !== fCriticality) return false;
      if (fCategory !== 'all' && r.category_id !== fCategory) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q) ||
        (r.url ?? '').toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [items, query, fType, fStatus, fVisibility, fCriticality, fCategory]);

  useEffect(() => { setPage(1); }, [query, fType, fStatus, fVisibility, fCriticality, fCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter(i => i.status === 'active').length,
    archived: items.filter(i => i.status === 'archived').length,
    public: items.filter(i => i.visibility === 'public').length,
    featured: items.filter(i => i.is_featured).length,
    files: items.filter(i => i.file_path).length,
  }), [items]);

  // Form
  const openCreate = () => {
    setEditing(null); setForm(emptyForm); setFile(null); setOpenForm(true);
  };
  const openEdit = (r: ResourceRow) => {
    setEditing(r);
    setForm({
      name: r.name,
      description: r.description ?? '',
      resource_type: r.resource_type,
      url: r.url ?? '',
      category_id: r.category_id ?? '',
      tags: r.tags.join(', '),
      visibility: r.visibility,
      status: r.status,
      criticality: r.criticality,
      language: r.language ?? '',
      version: r.version,
      is_featured: r.is_featured,
    });
    setFile(null);
    setOpenForm(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Le nom est requis'); return; }
    if (form.resource_type === 'link' && !form.url.trim()) {
      toast.error('Une URL est requise pour les liens'); return;
    }
    setSubmitting(true);

    let file_path: string | null = editing?.file_path ?? null;
    let file_size: number | null = editing?.file_size ?? null;
    let mime_type: string | null = editing?.mime_type ?? null;

    try {
      if (file && user) {
        const safeName = file.name.replace(/[^\w.\-]+/g, '_');
        const path = `${user.id}/${Date.now()}_${safeName}`;
        const { error: upErr } = await supabase.storage.from('resources').upload(path, file, {
          upsert: false, contentType: file.type,
        });
        if (upErr) throw upErr;
        file_path = path; file_size = file.size; mime_type = file.type;
      }

      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        resource_type: form.resource_type,
        url: form.url.trim() || null,
        file_path, file_size, mime_type,
        category_id: form.category_id || null,
        tags,
        visibility: form.visibility,
        status: form.status,
        criticality: form.criticality,
        language: form.language.trim() || null,
        version: form.version.trim() || '1.0.0',
        is_featured: form.is_featured,
      };

      if (editing) {
        const { error } = await supabase.from('resources').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Ressource mise à jour');
      } else {
        const { error } = await supabase.from('resources').insert({ ...payload, author_id: user?.id ?? null });
        if (error) throw error;
        toast.success('Ressource créée');
      }
      setOpenForm(false);
      load();
    } catch (err: any) {
      toast.error('Erreur', { description: err?.message ?? 'Action impossible' });
    } finally {
      setSubmitting(false);
    }
  };

  const doDelete = async (r: ResourceRow) => {
    const { moveToTrash } = await import('@/lib/trash');
    const t = await moveToTrash({ resourceType: 'resource', rows: [r] });
    if (!t.ok) { toast.error(t.error ?? 'Erreur'); return; }
    const { error } = await supabase.from('resources').delete().eq('id', r.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Ressource déplacée dans la corbeille');
    setConfirmDelete(null);
    load();
  };

  const toggleVisibility = async (r: ResourceRow) => {
    const next: ResVisibility = r.visibility === 'public' ? 'private' : 'public';
    const { error } = await supabase.from('resources').update({ visibility: next }).eq('id', r.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Ressource ${next === 'public' ? 'publiée' : 'masquée'}`);
    load();
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const selectAll = () => setSelected(new Set(paged.map(r => r.id)));
  const clearSelection = () => setSelected(new Set());

  const bulkArchive = async () => {
    const ids = Array.from(selected);
    const { error } = await supabase.from('resources').update({ status: 'archived' }).in('id', ids);
    if (error) { toast.error(error.message); return; }
    toast.success(`${ids.length} ressource(s) archivée(s)`);
    setSelected(new Set()); setConfirmBulk(null); load();
  };
  const bulkDelete = async () => {
    const ids = Array.from(selected);
    const toDel = items.filter(i => ids.includes(i.id));
    const { moveToTrash } = await import('@/lib/trash');
    const t = await moveToTrash({ resourceType: 'resource', rows: toDel });
    if (!t.ok) { toast.error(t.error ?? 'Erreur'); return; }
    const { error } = await supabase.from('resources').delete().in('id', ids);
    if (error) { toast.error(error.message); return; }
    toast.success(`${ids.length} ressource(s) déplacée(s) dans la corbeille`);
    setSelected(new Set()); setConfirmBulk(null); load();
  };

  const downloadFile = async (r: ResourceRow) => {
    if (!r.file_path) return;
    const { data, error } = await supabase.storage.from('resources').createSignedUrl(r.file_path, 60);
    if (error || !data?.signedUrl) { toast.error('Téléchargement impossible'); return; }
    await supabase.from('resources').update({ downloads_count: r.downloads_count + 1 }).eq('id', r.id);
    window.open(data.signedUrl, '_blank');
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `resources_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text('Bibliothèque de ressources', 14, 16);
    doc.setFontSize(10); doc.text(`Export du ${new Date().toLocaleString('fr-FR')}`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [['Nom', 'Type', 'Statut', 'Visibilité', 'Tags']],
      body: filtered.map(r => [
        r.name, TYPE_META[r.resource_type].label, STATUS_META[r.status].label,
        r.visibility, r.tags.join(', '),
      ]),
      styles: { fontSize: 8 },
    });
    doc.save(`resources_${Date.now()}.pdf`);
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: Library, cls: 'from-card to-primary/5 border-primary/30 text-primary' },
    { label: 'Actives', value: stats.active, icon: CheckCircle2, cls: 'from-card to-success/10 border-success/30 text-success' },
    { label: 'Archivées', value: stats.archived, icon: Archive, cls: 'from-card to-warning/10 border-warning/30 text-warning' },
    { label: 'Publiques', value: stats.public, icon: Eye, cls: 'from-card to-blue-500/10 border-blue-500/30 text-blue-400' },
    { label: 'Mises en avant', value: stats.featured, icon: Star, cls: 'from-card to-amber-500/10 border-amber-500/30 text-amber-400' },
    { label: 'Fichiers', value: stats.files, icon: FileArchive, cls: 'from-card to-violet-500/10 border-violet-500/30 text-violet-400' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <header className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
                <span>/</span><span className="text-foreground">Ressources</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Library className="h-6 w-6 text-primary" /> Bibliothèque de ressources
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Centralisez liens, documents, fichiers et autres ressources utiles à votre équipe.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Exporter</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportJSON}><FileJson className="h-4 w-4" /> JSON</DropdownMenuItem>
                  <DropdownMenuItem onClick={exportPDF}><FileDown className="h-4 w-4" /> PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {canCreate && (
                <Button onClick={openCreate}><Plus className="h-4 w-4" /> Nouvelle ressource</Button>
              )}
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {statCards.map(s => (
            <article key={s.label}
              className={`rounded-xl border bg-gradient-to-br p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${s.cls.replace(/text-\S+/, '').replace('border-', 'border-border/60 hover:border-')}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums">{s.value}</p>
                </div>
                <div className={`rounded-lg border p-2 ${s.cls.split(' ').filter(c => c.startsWith('text-') || c.startsWith('border-')).join(' ')} bg-background/40`}>
                  <s.icon className="h-4 w-4" />
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Filters */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Rechercher par nom, description, URL, tags…"
                value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={saveFilters}><Filter className="h-4 w-4" /> Sauvegarder</Button>
              <Button variant="ghost" size="sm" onClick={resetFilters}><X className="h-4 w-4" /> Réinit.</Button>
              <div className="hidden md:flex rounded-md border border-border/60 overflow-hidden">
                <button onClick={() => setView('grid')}
                  className={`p-2 ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`}
                  aria-label="Vue grille"><LayoutGrid className="h-4 w-4" /></button>
                <button onClick={() => setView('table')}
                  className={`p-2 ${view === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`}
                  aria-label="Vue tableau"><Table2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Select value={fType} onValueChange={setFType}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                {Object.entries(TYPE_META).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fStatus} onValueChange={setFStatus}>
              <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                {Object.entries(STATUS_META).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fVisibility} onValueChange={setFVisibility}>
              <SelectTrigger><SelectValue placeholder="Visibilité" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="public">Publique</SelectItem>
                <SelectItem value="private">Privée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fCriticality} onValueChange={setFCriticality}>
              <SelectTrigger><SelectValue placeholder="Criticité" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {Object.entries(CRIT_META).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fCategory} onValueChange={setFCategory}>
              <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{selected.size} sélectionnée(s)</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>Tout sélectionner (page)</Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>Désélectionner</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmBulk('archive')}>
                <Archive className="h-4 w-4" /> Archiver
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setConfirmBulk('delete')}>
                <Trash2 className="h-4 w-4" /> Supprimer
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/50 p-12 text-center">
            <Library className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Aucune ressource trouvée</p>
            <p className="text-xs text-muted-foreground mt-1">Modifiez vos filtres ou créez une nouvelle ressource.</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {paged.map(r => {
              const meta = TYPE_META[r.resource_type];
              const cat = categories.find(c => c.id === r.category_id);
              const isSel = selected.has(r.id);
              return (
                <article key={r.id}
                  className={`group rounded-xl border bg-card p-4 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 ${isSel ? 'border-primary ring-1 ring-primary/30' : 'border-border/60 hover:border-primary/40'}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSel} onCheckedChange={() => toggleSelect(r.id)} className="mt-1" />
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${meta.cls}`}>
                      <meta.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {r.name}
                          {r.is_featured && <Star className="inline h-3 w-3 ml-1 fill-amber-400 text-amber-400" />}
                        </h3>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                        {r.description || 'Pas de description'}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className={`text-[10px] ${meta.cls}`}>{meta.label}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_META[r.status].cls}`}>{STATUS_META[r.status].label}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${CRIT_META[r.criticality].cls}`}>{CRIT_META[r.criticality].label}</Badge>
                        {cat && (
                          <Badge variant="outline" className="text-[10px]" style={{ borderColor: `${cat.color}40`, color: cat.color, background: `${cat.color}15` }}>
                            {cat.name}
                          </Badge>
                        )}
                      </div>
                      {r.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {r.tags.slice(0, 4).map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground">#{t}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground tabular-nums">
                          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{r.views_count}</span>
                          <span className="inline-flex items-center gap-1"><Download className="h-3 w-3" />{r.downloads_count}</span>
                          {r.file_size && <span>{formatBytes(r.file_size)}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          {r.url && (
                            <a href={r.url} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-primary transition-colors"
                              title="Ouvrir le lien"><ExternalLink className="h-3.5 w-3.5" /></a>
                          )}
                          {r.file_path && (
                            <button onClick={() => downloadFile(r)}
                              className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-primary transition-colors"
                              title="Télécharger"><Download className="h-3.5 w-3.5" /></button>
                          )}
                          {canCreate && (
                            <>
                              <button onClick={() => toggleVisibility(r)}
                                className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                                title={r.visibility === 'public' ? 'Masquer' : 'Publier'}>
                                {r.visibility === 'public' ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                              <button onClick={() => openEdit(r)}
                                className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground" title="Modifier">
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => setConfirmDelete(r)}
                                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Supprimer">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs uppercase text-muted-foreground tracking-wider">
                    <th className="px-3 py-3 w-8">
                      <Checkbox
                        checked={paged.length > 0 && paged.every(p => selected.has(p.id))}
                        onCheckedChange={(c) => c ? selectAll() : clearSelection()} />
                    </th>
                    <th className="text-left px-3 py-3 font-medium">Nom</th>
                    <th className="text-left px-3 py-3 font-medium">Type</th>
                    <th className="text-left px-3 py-3 font-medium">Statut</th>
                    <th className="text-left px-3 py-3 font-medium">Visibilité</th>
                    <th className="text-left px-3 py-3 font-medium">Tags</th>
                    <th className="text-right px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(r => {
                    const meta = TYPE_META[r.resource_type];
                    return (
                      <tr key={r.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                        <td className="px-3 py-2">
                          <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <meta.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{r.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{r.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={`text-[10px] ${meta.cls}`}>{meta.label}</Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={`text-[10px] ${STATUS_META[r.status].cls}`}>{STATUS_META[r.status].label}</Badge>
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-1 text-xs">
                            {r.visibility === 'public' ? <Eye className="h-3 w-3 text-success" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            {r.visibility}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[160px]">
                          {r.tags.slice(0, 3).join(', ')}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-1">
                            {r.url && <Button size="sm" variant="ghost" asChild><a href={r.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>}
                            {r.file_path && <Button size="sm" variant="ghost" onClick={() => downloadFile(r)}><Download className="h-4 w-4" /></Button>}
                            {canCreate && <>
                              <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Edit3 className="h-4 w-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3">
            <p className="text-xs text-muted-foreground tabular-nums">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs tabular-nums px-2">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editing ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editing ? 'Modifier la ressource' : 'Nouvelle ressource'}
            </DialogTitle>
            <DialogDescription>
              Partagez un lien, un document, un fichier ou toute autre ressource utile.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label>Nom *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={form.resource_type} onValueChange={(v) => setForm({ ...form, resource_type: v as ResourceType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_META).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={form.category_id || 'none'} onValueChange={(v) => setForm({ ...form, category_id: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>URL {form.resource_type === 'link' && <span className="text-destructive">*</span>}</Label>
              <Input type="url" placeholder="https://…" value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Fichier (optionnel)</Label>
              <input ref={fileInputRef} type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
              {editing?.file_path && !file && (
                <p className="text-xs text-muted-foreground">Fichier actuel : {editing.file_path.split('/').pop()} ({formatBytes(editing.file_size)})</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Visibilité</Label>
              <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v as ResVisibility })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Publique</SelectItem>
                  <SelectItem value="private">Privée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ResStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_META).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Criticité</Label>
              <Select value={form.criticality} onValueChange={(v) => setForm({ ...form, criticality: v as ResCriticality })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CRIT_META).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Version</Label>
              <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Langue</Label>
              <Input placeholder="fr, en…" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Tags (séparés par des virgules)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="azure, documentation, terraform" />
            </div>
            <label className="md:col-span-2 flex items-center gap-2 px-3 py-2 rounded-md border border-border/60 cursor-pointer hover:bg-secondary/30">
              <Checkbox checked={form.is_featured} onCheckedChange={(c) => setForm({ ...form, is_featured: !!c })} />
              <span className="text-sm flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-400" /> Mettre en avant cette ressource</span>
            </label>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpenForm(false)}>Annuler</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? 'Enregistrer' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete single */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Supprimer cette ressource ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              « {confirmDelete?.name} » sera définitivement supprimée. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && doDelete(confirmDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk confirm */}
      <AlertDialog open={!!confirmBulk} onOpenChange={(o) => !o && setConfirmBulk(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmBulk === 'delete' ? `Supprimer ${selected.size} ressource(s) ?` : `Archiver ${selected.size} ressource(s) ?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmBulk === 'delete'
                ? 'Cette action est irréversible et supprimera aussi les fichiers associés.'
                : 'Les ressources sélectionnées seront marquées comme archivées.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulk === 'delete' ? bulkDelete : bulkArchive}
              className={confirmBulk === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
