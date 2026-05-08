import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  LayoutGrid,
  Table2,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Loader2,
  Folder,
  CheckCircle2,
  XCircle,
  Archive,
  Sparkles,
  ArrowUpRight,
  ArrowDownAZ,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  FileCode2,
  FileJson,
  Upload,
  Check,
  AlertTriangle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as LucideIcons from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Status = 'active' | 'inactive' | 'archived';

interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  status: Status;
  is_visible: boolean;
  type: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

const ICON_CHOICES = [
  'Folder', 'FolderTree', 'Cloud', 'Server', 'Shield', 'Database',
  'Cpu', 'Network', 'Globe', 'Rocket', 'Layers', 'Box', 'Settings',
  'Users', 'Lock', 'Key', 'Zap', 'Code2', 'Terminal',
];

const COLOR_CHOICES = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#06b6d4',
];
const PAGE_SIZE = 10;
const IMPORT_SAMPLE = [
  {
    name: 'Ressources Azure',
    description: 'Scripts utilitaires de gestion des ressources.',
    color: '#3b82f6',
    icon: 'Folder',
    status: 'active',
    is_visible: true,
    type: 'systeme',
  },
  {
    name: 'Securite',
    description: 'Scripts de controle et audit securite.',
    color: '#ef4444',
    icon: 'Shield',
    status: 'inactive',
    is_visible: true,
    type: 'compliance',
  },
];

type ExportFormat = 'pdf' | 'csv';
type ImportDraft = Partial<Category> & { line: number };

interface ImportError {
  line: number;
  message: string;
}

function IconRender({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name] ?? Folder;
  return <Icon className={className} />;
}

const EMPTY_FORM: Partial<Category> = {
  name: '',
  description: '',
  color: '#3b82f6',
  icon: 'Folder',
  status: 'active',
  is_visible: true,
  type: '',
};

export default function CategoriesPage() {
  const { user, hasRole } = useAuth();
  const canWrite = hasRole('global_admin') || hasRole('admin') || hasRole('editor');
  const canDelete = hasRole('global_admin') || hasRole('admin');

  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [scriptCountByCategory, setScriptCountByCategory] = useState<Record<string, number>>({});
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Partial<Category>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importPreview, setImportPreview] = useState<ImportDraft[]>([]);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('En attente');
  const [importSummary, setImportSummary] = useState<{ created: number; skipped: number; errors: number } | null>(null);
  const [importDoneDialogOpen, setImportDoneDialogOpen] = useState(false);

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateDownloading, setTemplateDownloading] = useState(false);
  const [templateProgress, setTemplateProgress] = useState(0);
  const [templateDoneDialogOpen, setTemplateDoneDialogOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const [categoriesRes, scriptsRes] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase.from('scripts').select('category_id').not('category_id', 'is', null),
    ]);
    if (categoriesRes.error) toast.error(categoriesRes.error.message);
    if (scriptsRes.error) toast.error(scriptsRes.error.message);
    setItems((categoriesRes.data as Category[]) ?? []);
    const counts: Record<string, number> = {};
    (scriptsRes.data ?? []).forEach((row: { category_id: string | null }) => {
      if (!row.category_id) return;
      counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
    });
    setScriptCountByCategory(counts);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((c) => c.status === 'active').length;
    const inactive = items.filter((c) => c.status === 'inactive').length;
    const archived = items.filter((c) => c.status === 'archived').length;
    const visible = items.filter((c) => c.is_visible).length;
    const hidden = total - visible;
    const last = items[0]?.name ?? '—';
    return { total, active, inactive, archived, visible, hidden, last };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((c) => {
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q);
      const matchS = statusFilter === 'all' || c.status === statusFilter;
      return matchQ && matchS;
    });
  }, [items, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    if (view !== 'table') return filtered;
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage, view]);

  useEffect(() => {
    setSelectedIds([]);
  }, [search, statusFilter, view, currentPage]);

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm(c);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name?.trim()) return toast.error('Le nom est requis');
    setSaving(true);
    if (editing) {
      const { error } = await supabase
        .from('categories')
        .update({
          name: form.name!.trim(),
          description: form.description?.trim() || null,
          color: form.color!,
          icon: form.icon!,
          status: form.status as Status,
          is_visible: form.is_visible ?? true,
          type: form.type?.trim() || null,
        })
        .eq('id', editing.id);
      if (error) {
        setSaving(false);
        return toast.error(error.message);
      }
      toast.success('Catégorie mise à jour');
    } else {
      const { error } = await supabase.from('categories').insert({
        name: form.name!.trim(),
        description: form.description?.trim() || null,
        color: form.color!,
        icon: form.icon!,
        status: (form.status as Status) ?? 'active',
        is_visible: form.is_visible ?? true,
        type: form.type?.trim() || null,
        created_by: user?.id ?? null,
      });
      if (error) {
        setSaving(false);
        return toast.error(error.message);
      }
      toast.success('Catégorie créée');
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const remove = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from('categories').delete().eq('id', toDelete.id);
    if (error) return toast.error(error.message);
    toast.success('Catégorie supprimée');
    setToDelete(null);
    load();
  };

  const toggleStatus = async (c: Category) => {
    const next: Status = c.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('categories').update({ status: next }).eq('id', c.id);
    if (error) return toast.error(error.message);
    toast.success(next === 'active' ? 'Activée' : 'Désactivée');
    load();
  };

  const toggleVisible = async (c: Category) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_visible: !c.is_visible })
      .eq('id', c.id);
    if (error) return toast.error(error.message);
    load();
  };

  const duplicate = async (c: Category) => {
    const { error } = await supabase.from('categories').insert({
      name: `${c.name} (copie)`,
      description: c.description,
      color: c.color,
      icon: c.icon,
      status: c.status,
      is_visible: c.is_visible,
      type: c.type,
      created_by: user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    toast.success('Catégorie dupliquée');
    load();
  };

  const archive = async (c: Category) => {
    const { error } = await supabase.from('categories').update({ status: 'archived' as Status }).eq('id', c.id);
    if (error) return toast.error(error.message);
    toast.success('Archivée');
    load();
  };

  const selectAllOnPage = () => {
    const ids = paginatedItems.map((c) => c.id);
    setSelectedIds(ids);
  };

  const clearSelection = () => setSelectedIds([]);

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const archiveSelected = async () => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase.from('categories').update({ status: 'archived' as Status }).in('id', selectedIds);
    if (error) return toast.error(error.message);
    toast.success(`${selectedIds.length} catégories archivées`);
    setSelectedIds([]);
    load();
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase.from('categories').delete().in('id', selectedIds);
    if (error) return toast.error(error.message);
    toast.success(`${selectedIds.length} catégories supprimées`);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
    load();
  };

  const toCsv = (rows: Category[]) => {
    const headers = ['id', 'name', 'description', 'color', 'icon', 'status', 'is_visible', 'type', 'position', 'created_at', 'updated_at'];
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const lines = [
      headers.join(','),
      ...rows.map((c) =>
        [
          c.id,
          c.name,
          c.description ?? '',
          c.color,
          c.icon,
          c.status,
          c.is_visible,
          c.type ?? '',
          c.position,
          c.created_at,
          c.updated_at,
        ].map(escape).join(',')
      ),
    ];
    return lines.join('\n');
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCategories = async () => {
    if (items.length === 0) return toast.error('Aucune categorie a exporter');
    setExporting(true);
    setExportProgress(15);
    await new Promise((r) => setTimeout(r, 180));
    setExportProgress(45);

    const timestamp = new Date();
    const exportLabel = timestamp.toLocaleString('fr-FR');
    const safeDate = timestamp.toISOString().replace(/[:.]/g, '-');

    if (exportFormat === 'csv') {
      const csv = toCsv(items);
      setExportProgress(90);
      triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `categories-${safeDate}.csv`);
      setExportProgress(100);
      setTimeout(() => {
        setExporting(false);
        setExportDialogOpen(false);
        toast.success('Export CSV termine');
      }, 250);
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 86, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('Script Hub Tools', 40, 42);
    doc.setFontSize(12);
    doc.setTextColor(191, 219, 254);
    doc.text('Export des catégories', 40, 64);
    doc.setTextColor(255, 255, 255);
    doc.text(`Date export: ${exportLabel}`, doc.internal.pageSize.getWidth() - 230, 42);
    doc.text(`Total: ${items.length}`, doc.internal.pageSize.getWidth() - 230, 64);
    setExportProgress(70);

    autoTable(doc, {
      startY: 108,
      head: [['Nom', 'Description', 'Type', 'Statut', 'Visible', 'Couleur', 'Icone', 'MAJ']],
      body: items.map((c) => [
        c.name,
        c.description || '—',
        c.type || '—',
        c.status,
        c.is_visible ? 'Oui' : 'Non',
        c.color,
        c.icon,
        new Date(c.updated_at).toLocaleDateString('fr-FR'),
      ]),
      styles: { fontSize: 9, cellPadding: 6, textColor: [30, 41, 59] },
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 24, right: 24 },
      didDrawPage: () => {
        const pageCount = doc.getNumberOfPages();
        const pageCurrent = doc.getCurrentPageInfo().pageNumber;
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Page ${pageCurrent}/${pageCount}`, doc.internal.pageSize.getWidth() - 70, doc.internal.pageSize.getHeight() - 12);
      },
    });

    setExportProgress(95);
    doc.save(`categories-${safeDate}.pdf`);
    setExportProgress(100);
    setTimeout(() => {
      setExporting(false);
      setExportDialogOpen(false);
      toast.success('Export PDF termine');
    }, 300);
  };

  const downloadJsonTemplate = async () => {
    setTemplateDownloading(true);
    setTemplateProgress(10);
    await new Promise((r) => setTimeout(r, 180));
    setTemplateProgress(40);
    await new Promise((r) => setTimeout(r, 180));
    setTemplateProgress(75);
    const payload = JSON.stringify(IMPORT_SAMPLE, null, 2);
    triggerDownload(new Blob([payload], { type: 'application/json' }), 'categories-template.json');
    setTemplateProgress(100);
    setTimeout(() => {
      setTemplateDownloading(false);
      setTemplateDialogOpen(false);
      setTemplateDoneDialogOpen(true);
      toast.success('Modele JSON telecharge');
    }, 250);
  };

  const normalizeCategory = (entry: any, line: number): { parsed?: ImportDraft; error?: ImportError } => {
    if (!entry || typeof entry !== 'object') {
      return { error: { line, message: 'Format invalide: objet attendu' } };
    }
    const status = String(entry.status ?? 'active') as Status;
    if (!entry.name || typeof entry.name !== 'string' || entry.name.trim().length < 2) {
      return { error: { line, message: 'Nom invalide (min 2 caracteres)' } };
    }
    if (!['active', 'inactive', 'archived'].includes(status)) {
      return { error: { line, message: 'Statut invalide (active, inactive, archived)' } };
    }
    const color = String(entry.color ?? '#3b82f6');
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return { error: { line, message: 'Couleur invalide (format #RRGGBB)' } };
    }
    return {
      parsed: {
        line,
        name: entry.name.trim(),
        description: typeof entry.description === 'string' ? entry.description.trim() : '',
        color,
        icon: typeof entry.icon === 'string' && entry.icon ? entry.icon : 'Folder',
        status,
        is_visible: typeof entry.is_visible === 'boolean' ? entry.is_visible : true,
        type: typeof entry.type === 'string' ? entry.type.trim() : '',
      },
    };
  };

  const onFilePicked = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.json')) {
      toast.error('Veuillez selectionner un fichier JSON');
      return;
    }
    setImportFileName(file.name);
    setImportErrors([]);
    setImportSummary(null);
    const text = await file.text();
    let parsedRaw: unknown;
    try {
      parsedRaw = JSON.parse(text);
    } catch {
      setImportPreview([]);
      setImportErrors([{ line: 1, message: 'JSON invalide (erreur de syntaxe)' }]);
      return;
    }
    const list = Array.isArray(parsedRaw) ? parsedRaw : [parsedRaw];
    const preview: ImportDraft[] = [];
    const errs: ImportError[] = [];
    list.forEach((entry, idx) => {
      const result = normalizeCategory(entry, idx + 1);
      if (result.error) errs.push(result.error);
      if (result.parsed) preview.push(result.parsed);
    });
    setImportPreview(preview);
    setImportErrors(errs);
    if (preview.length > 0) toast.success(`${preview.length} categories detectees`);
  };

  const importJson = async () => {
    if (importPreview.length === 0) {
      toast.error('Aucune categorie valide a importer');
      return;
    }
    setImporting(true);
    setImportProgress(0);
    setImportStatus('Initialisation de l import...');
    let created = 0;
    let skipped = 0;
    const errs = [...importErrors];
    const knownNames = new Set(items.map((c) => c.name.toLowerCase()));
    for (let i = 0; i < importPreview.length; i += 1) {
      const row = importPreview[i];
      const name = row.name?.trim();
      setImportStatus(`Traitement ligne ${row.line}...`);
      if (!name) {
        skipped += 1;
        errs.push({ line: row.line, message: 'Nom manquant' });
        setImportProgress(Math.round(((i + 1) / importPreview.length) * 100));
        continue;
      }
      const exists = knownNames.has(name.toLowerCase());
      if (exists) {
        skipped += 1;
        errs.push({ line: row.line, message: `Ignoree: categorie "${name}" deja existante` });
        setImportProgress(Math.round(((i + 1) / importPreview.length) * 100));
        setImportStatus(`Ligne ${row.line} ignoree (doublon)`);
        continue;
      }
      const { error } = await supabase.from('categories').insert({
        name,
        description: row.description?.trim() || null,
        color: row.color ?? '#3b82f6',
        icon: row.icon ?? 'Folder',
        status: (row.status as Status) ?? 'active',
        is_visible: row.is_visible ?? true,
        type: row.type?.trim() || null,
        created_by: user?.id ?? null,
      });
      if (error) {
        errs.push({ line: row.line, message: error.message });
        setImportStatus(`Erreur ligne ${row.line}`);
      } else {
        created += 1;
        knownNames.add(name.toLowerCase());
        setImportStatus(`Categorie "${name}" creee`);
      }
      setImportProgress(Math.round(((i + 1) / importPreview.length) * 100));
    }
    setImportErrors(errs);
    setImportSummary({ created, skipped, errors: errs.length });
    setImporting(false);
    setImportStatus('Import termine');
    if (created > 0) {
      toast.success(`${created} categories creees`);
      await load();
      setImportDoneDialogOpen(true);
    } else {
      toast.error('Aucune categorie n a ete creee');
    }
  };

  const resetImport = () => {
    setImportFileName('');
    setImportPreview([]);
    setImportErrors([]);
    setImportSummary(null);
    setImportProgress(0);
    setImporting(false);
    setImportStatus('En attente');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <header className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Catégories</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Organisez et gérez vos catégories de manière organisée.
              </p>
            </div>
            {canWrite && (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => setTemplateDialogOpen(true)}>
                  <FileJson className="h-4 w-4" /> Modèle JSON
                </Button>
                <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                  <Upload className="h-4 w-4" /> Importer JSON
                </Button>
                <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
                  <Download className="h-4 w-4" /> Télécharger
                </Button>
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Nouvelle catégorie
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard label="Total" value={stats.total} icon={Folder} accent="bg-blue-500/10 text-blue-400" delay={0} />
          <StatCard label="Actives" value={stats.active} icon={CheckCircle2} accent="bg-emerald-500/10 text-emerald-400" delay={70} />
          <StatCard label="Inactives" value={stats.inactive} icon={XCircle} accent="bg-amber-500/10 text-amber-400" delay={140} />
          <StatCard label="Archivées" value={stats.archived} icon={Archive} accent="bg-muted text-muted-foreground" delay={210} />
          <StatCard label="Visibles" value={stats.visible} icon={Eye} accent="bg-violet-500/10 text-violet-400" delay={280} />
          <StatCard label="Masquées" value={stats.hidden} icon={EyeOff} accent="bg-rose-500/10 text-rose-400" delay={350} />
        </section>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="active">Actives</SelectItem>
              <SelectItem value="inactive">Inactives</SelectItem>
              <SelectItem value="archived">Archivées</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-md border border-border bg-background p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded ${view === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
              aria-label="Vue grille"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-1.5 rounded ${view === 'table' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
              aria-label="Vue tableau"
            >
              <Table2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={canWrite ? openCreate : undefined} />
        ) : view === 'grid' ? (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <CategoryCard
                key={c.id}
                c={c}
                scriptCount={scriptCountByCategory[c.id] ?? 0}
                canWrite={canWrite}
                canDelete={canDelete}
                onEdit={() => openEdit(c)}
                onDelete={() => setToDelete(c)}
                onToggleStatus={() => toggleStatus(c)}
                onToggleVisible={() => toggleVisible(c)}
                onDuplicate={() => duplicate(c)}
                onArchive={() => archive(c)}
              />
            ))}
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2">
              <Button variant="outline" size="sm" onClick={selectAllOnPage}>
                Sélectionner tout
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Désélectionner
              </Button>
              <Button variant="outline" size="sm" onClick={archiveSelected} disabled={selectedIds.length === 0}>
                Archiver
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
                disabled={selectedIds.length === 0}
              >
                Supprimer 
              </Button>
              <span className="text-xs text-muted-foreground ml-auto">
                {selectedIds.length} sélectionnée(s)
              </span>
            </div>
            <CategoryTable
              items={paginatedItems}
              scriptCountByCategory={scriptCountByCategory}
              canWrite={canWrite}
              canDelete={canDelete}
              selectedIds={selectedIds}
              onToggleSelect={toggleRowSelection}
              onEdit={openEdit}
              onDelete={(c) => setToDelete(c)}
              onToggleStatus={toggleStatus}
              onToggleVisible={toggleVisible}
              onDuplicate={duplicate}
              onArchive={archive}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Affichage de <span className="font-medium text-foreground">{paginatedItems.length}</span> sur{' '}
                <span className="font-medium text-foreground">{filtered.length}</span> catégories
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page <span className="font-medium text-foreground">{currentPage}</span> / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
            <DialogDescription>
              Renseignez les informations de la catégorie.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-4 rounded-lg border border-border/60 bg-card/60 p-4">
              <h4 className="text-sm font-semibold text-foreground">Informations générales</h4>
              <div className="space-y-1.5">
                <Label>Nom *</Label>
                <Input
                  value={form.name ?? ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Ressources Azure"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Statut</Label>
                  <Select
                    value={form.status ?? 'active'}
                    onValueChange={(v) => setForm({ ...form, status: v as Status })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archivée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Input
                    value={form.type ?? ''}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    placeholder="Ex: système"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_visible ?? true}
                  onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                Visible publiquement
              </label>
            </div>
            <div className="space-y-4 rounded-lg border border-border/60 bg-card/60 p-4">
              <h4 className="text-sm font-semibold text-foreground">Personnalisation visuelle</h4>
              <div className="space-y-2">
                <Label>Couleur</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_CHOICES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`h-8 w-8 rounded-md border-2 transition ${form.color === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={form.color ?? '#3b82f6'}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="h-8 w-12 cursor-pointer rounded border border-border bg-transparent"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Icône</Label>
                <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto border border-border rounded-md p-2">
                  {ICON_CHOICES.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setForm({ ...form, icon: name })}
                      className={`flex items-center justify-center h-9 rounded-md border transition ${form.icon === name ? 'border-primary bg-primary/10 text-primary' : 'border-transparent text-muted-foreground hover:bg-secondary'}`}
                      title={name}
                    >
                      <IconRender name={name} className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Exporter les categories</DialogTitle>
            <DialogDescription>
              Choisissez le format de fichier pour télécharger la liste complete des catégories.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('pdf')}
                className={`rounded-lg border p-3 text-left transition ${exportFormat === 'pdf' ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary/40'}`}
              >
                <p className="font-medium text-foreground">PDF</p>
                <p className="text-xs text-muted-foreground mt-1">Logo, pagination, tableau moderne</p>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`rounded-lg border p-3 text-left transition ${exportFormat === 'csv' ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary/40'}`}
              >
                <p className="font-medium text-foreground">CSV</p>
                <p className="text-xs text-muted-foreground mt-1">Compatible Excel/Sheets</p>
              </button>
            </div>
            {exporting && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Génération du fichier...</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={exporting} onClick={() => setExportDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={exportCategories} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              {exporting ? 'Generation...' : `Exporter en ${exportFormat.toUpperCase()}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={templateDialogOpen}
        onOpenChange={(open) => {
          if (templateDownloading) return;
          setTemplateDialogOpen(open);
          if (!open) setTemplateProgress(0);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Télécharger le modèle JSON</DialogTitle>
            <DialogDescription>
              Voulez-vous télécharger le fichier JSON préconfiguré pour l import des catégories ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {templateDownloading && (
              <>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Téléchargement en cours...</span>
                  <span>{templateProgress}%</span>
                </div>
                <Progress value={templateProgress} />
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={templateDownloading} onClick={() => setTemplateDialogOpen(false)}>
              Annuler
            </Button>
            <Button disabled={templateDownloading} onClick={downloadJsonTemplate}>
              {templateDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson className="h-4 w-4" />}
              {templateDownloading ? 'Téléchargement...' : 'Valider'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importDialogOpen} onOpenChange={(open) => {
        setImportDialogOpen(open);
        if (!open) resetImport();
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Importer des catégories via JSON</DialogTitle>
            <DialogDescription>
              Glissez-déposez votre fichier JSON ou utilisez le bouton de sélection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) onFilePicked(file);
              }}
              className={`rounded-xl border-2 border-dashed p-6 text-center transition ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border/70 bg-card/50'}`}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-foreground font-medium">Déposez votre fichier JSON ici</p>
              <p className="text-xs text-muted-foreground mt-1">ou cliquez pour sélectionner</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFilePicked(e.target.files[0])}
              />
              <Button type="button" variant="outline" className="mt-3" onClick={() => fileInputRef.current?.click()}>
                Choisir un fichier
              </Button>
              {importFileName && <p className="text-xs text-muted-foreground mt-3">Fichier: {importFileName}</p>}
            </div>

            {importing && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{importStatus}</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} />
              </div>
            )}

            {importPreview.length > 0 && !importing && (
              <div className="rounded-lg border border-border/60 p-3 animate-fade-in">
                <p className="text-sm text-foreground">
                  Fichier valide: <span className="font-semibold">{importPreview.length}</span> catégories prêtes à importer.
                </p>
              </div>
            )}

            {importErrors.length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 animate-fade-in">
                <p className="text-sm font-medium text-destructive mb-2">Erreurs detectees ({importErrors.length})</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {importErrors.map((err, idx) => (
                    <p key={`${err.line}-${idx}`} className="text-xs text-destructive/90">
                      Ligne {err.line}: {err.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {importSummary && (
              <div className="grid grid-cols-3 gap-3 animate-fade-in">
                <SummaryCard icon={Check} label="Creees" value={importSummary.created} tone="success" />
                <SummaryCard icon={ArrowDownAZ} label="Ignorees" value={importSummary.skipped} tone="muted" />
                <SummaryCard icon={AlertTriangle} label="Erreurs" value={importSummary.errors} tone="danger" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(true)}>
              <FileJson className="h-4 w-4" /> Télécharger modèle JSON
            </Button>
            <Button onClick={importJson} disabled={importing || importPreview.length === 0}>
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {importing ? 'Import en cours...' : 'Importer et créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateDoneDialogOpen} onOpenChange={setTemplateDoneDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Téléchargement terminé</DialogTitle>
            <DialogDescription>
              Le fichier modèle JSON a bien été téléchargé sur votre machine.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setTemplateDoneDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importDoneDialogOpen} onOpenChange={setImportDoneDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Importation terminée</DialogTitle>
            <DialogDescription>
              Les catégories ont été traitées avec succès.
              {importSummary && (
                <span className="block mt-2 text-foreground">
                  Créées: {importSummary.created} | Ignorées: {importSummary.skipped} | Erreurs: {importSummary.errors}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setImportDoneDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. La catégorie « {toDelete?.name} » sera supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la sélection ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. {selectedIds.length} catégorie(s) seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

function StatCard({
  label, value, icon: Icon, accent, delay = 0,
}: { label: string; value: number; icon: any; accent: string; delay?: number }) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10 blur-2xl transition group-hover:scale-125 group-hover:bg-primary/20" />
      <div className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent} mb-3 ring-1 ring-border/40 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-6" />
      </div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground tabular-nums leading-tight">{value}</p>
    </div>
  );
}

function statusBadge(s: Status) {
  const map: Record<Status, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    archived: 'bg-muted text-muted-foreground border-border',
  };
  return map[s];
}

function CategoryCard({
  c, canWrite, canDelete,
  scriptCount, onEdit, onDelete, onToggleStatus, onToggleVisible, onDuplicate, onArchive,
}: any) {
  return (
    <div className="group rounded-xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all">
      <div className="h-2" style={{ backgroundColor: c.color }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${c.color}20`, color: c.color }}
            >
              <IconRender name={c.icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
              <p className="text-xs text-muted-foreground">{c.type || '—'}</p>
            </div>
          </div>
          {(canWrite || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canWrite && <DropdownMenuItem onClick={onEdit} className="gap-2"><Edit3 className="h-4 w-4" /> Modifier</DropdownMenuItem>}
                {canWrite && <DropdownMenuItem onClick={onToggleStatus} className="gap-2"><Sparkles className="h-4 w-4" /> {c.status === 'active' ? 'Désactiver' : 'Activer'}</DropdownMenuItem>}
                {canWrite && <DropdownMenuItem onClick={onToggleVisible} className="gap-2">{c.is_visible ? <><EyeOff className="h-4 w-4" /> Masquer</> : <><Eye className="h-4 w-4" /> Afficher</>}</DropdownMenuItem>}
                {canWrite && <DropdownMenuItem onClick={onDuplicate} className="gap-2"><Copy className="h-4 w-4" /> Dupliquer</DropdownMenuItem>}
                {canWrite && <DropdownMenuItem onClick={onArchive} className="gap-2"><Archive className="h-4 w-4" /> Archiver</DropdownMenuItem>}
                {canDelete && <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive"><Trash2 className="h-4 w-4" /> Supprimer</DropdownMenuItem>
                </>}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {c.description || 'Aucune description'}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusBadge(c.status)}>{c.status}</Badge>
            <Link to={`/scripts?category=${encodeURIComponent(c.id)}`}>
              <Badge variant="secondary" className="gap-1 hover:bg-primary/15 cursor-pointer transition-colors">
                <FileCode2 className="h-3.5 w-3.5" />
                {scriptCount} script(s)
              </Badge>
            </Link>
          </div>
          <span className="text-[11px] text-muted-foreground">{new Date(c.updated_at).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
    </div>
  );
}

function CategoryTable({
  items, scriptCountByCategory, canWrite, canDelete,
  selectedIds, onToggleSelect,
  onEdit, onDelete, onToggleStatus, onToggleVisible, onDuplicate, onArchive,
}: any) {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Choix</th>
              <th className="px-4 py-3 text-left">Catégorie</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Scripts</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Visibilité</th>
              <th className="px-4 py-3 text-left">Mise à jour</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c: Category) => (
              <tr key={c.id} className="border-t border-border/60 hover:bg-secondary/30 transition">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.id)}
                    onChange={() => onToggleSelect(c.id)}
                    className="h-4 w-4 rounded border-border"
                    aria-label={`Sélectionner ${c.name}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: `${c.color}20`, color: c.color }}
                    >
                      <IconRender name={c.icon} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[260px]">{c.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.type || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <Link
                    to={`/scripts?category=${encodeURIComponent(c.id)}`}
                    className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <FileCode2 className="h-3.5 w-3.5" />
                    {scriptCountByCategory[c.id] ?? 0}
                  </Link>
                </td>
                <td className="px-4 py-3"><Badge variant="outline" className={statusBadge(c.status)}>{c.status}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(c.updated_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">Actions</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canWrite && <DropdownMenuItem onClick={() => onEdit(c)} className="gap-2"><Edit3 className="h-4 w-4" /> Modifier</DropdownMenuItem>}
                      {canWrite && <DropdownMenuItem onClick={() => onToggleStatus(c)} className="gap-2"><Sparkles className="h-4 w-4" /> {c.status === 'active' ? 'Désactiver' : 'Activer'}</DropdownMenuItem>}
                      {canWrite && <DropdownMenuItem onClick={() => onToggleVisible(c)} className="gap-2">{c.is_visible ? <><EyeOff className="h-4 w-4" /> Masquer</> : <><Eye className="h-4 w-4" /> Afficher</>}</DropdownMenuItem>}
                      {canWrite && <DropdownMenuItem onClick={() => onDuplicate(c)} className="gap-2"><Copy className="h-4 w-4" /> Dupliquer</DropdownMenuItem>}
                      {canWrite && <DropdownMenuItem onClick={() => onArchive(c)} className="gap-2"><Archive className="h-4 w-4" /> Archiver</DropdownMenuItem>}
                      {canDelete && <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(c)} className="gap-2 text-destructive"><Trash2 className="h-4 w-4" /> Supprimer</DropdownMenuItem>
                      </>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-card/50 p-12 text-center">
      <ArrowDownAZ className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
      <h3 className="font-semibold text-foreground">Aucune catégorie</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Commencez par créer votre première catégorie.
      </p>
      {onCreate && (
        <Button onClick={onCreate} className="mt-4">
          <Plus className="h-4 w-4" /> Créer une catégorie
        </Button>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: number;
  tone: 'success' | 'muted' | 'danger';
}) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
      : tone === 'danger'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
        : 'border-border/60 bg-card text-muted-foreground';
  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide">{label}</p>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-bold mt-1 tabular-nums">{value}</p>
    </div>
  );
}
