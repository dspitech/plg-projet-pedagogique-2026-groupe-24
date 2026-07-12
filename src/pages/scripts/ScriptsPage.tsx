import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus, Search, LayoutGrid, Table2, List, Edit3, Trash2, Eye, EyeOff,
  Copy, Loader2, FileCode, CheckCircle2, XCircle, Archive, Sparkles,
  ArrowUpRight, ChevronLeft, ChevronRight, Download, FileJson, Upload,
  Globe, Lock, Star, AlertTriangle, Filter, ArrowUpDown, RefreshCw,
  Save, Tag, Users as UsersIcon, BarChart3,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
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
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';

type Status = 'draft' | 'active' | 'inactive' | 'archived' | 'deprecated';
type Criticality = 'low' | 'medium' | 'high' | 'critical';
type Visibility = 'public' | 'private';
type ScriptType =
  | 'powershell' | 'bash' | 'python' | 'azure_cli' | 'aws_cli'
  | 'terraform' | 'bicep' | 'arm' | 'cloudformation' | 'ansible'
  | 'kubernetes' | 'docker' | 'sql' | 'javascript' | 'typescript'
  | 'go' | 'ruby' | 'perl' | 'yaml' | 'json' | 'other';

const SCRIPT_TYPES: { value: ScriptType; label: string }[] = [
  { value: 'powershell', label: 'PowerShell' },
  { value: 'bash', label: 'Bash' },
  { value: 'python', label: 'Python' },
  { value: 'azure_cli', label: 'Azure CLI' },
  { value: 'aws_cli', label: 'AWS CLI' },
  { value: 'terraform', label: 'Terraform' },
  { value: 'bicep', label: 'Bicep' },
  { value: 'arm', label: 'ARM' },
  { value: 'cloudformation', label: 'CloudFormation' },
  { value: 'ansible', label: 'Ansible' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'docker', label: 'Docker' },
  { value: 'sql', label: 'SQL' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'perl', label: 'Perl' },
  { value: 'yaml', label: 'YAML' },
  { value: 'json', label: 'JSON' },
  { value: 'other', label: 'Autre' },
];

interface Script {
  id: string;
  name: string;
  description: string | null;
  script_type: ScriptType;
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
  version_history: any;
  downloads_count: number;
  views_count: number;
  average_rating: number;
  favorites_count: number;
  visibility: Visibility;
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryLite { id: string; name: string; color: string; }

const PAGE_SIZE = 10;
const SAVED_FILTERS_KEY = 'scripts_saved_filters_v1';

const EMPTY_FORM: Partial<Script> = {
  name: '',
  description: '',
  script_type: 'powershell',
  content: '',
  features: '',
  prerequisites: '',
  usage_example: '',
  screenshots: [],
  criticality: 'medium',
  version: '1.0.0',
  status: 'draft',
  tags: [],
  category_id: null,
  license: 'MIT',
  language: '',
  compatibility: '',
  dependencies: '',
  documentation: '',
  visibility: 'private',
};

const IMPORT_SAMPLE = [
  {
    schema_version: '1.0.0',
    script: {
      metadata: {
        name: 'Audit ressources Azure',
        description: 'Script PowerShell pour auditer les ressources Azure.',
        category_id: null,
        tags: ['azure', 'audit'],
        criticality: 'high',
        status: 'active',
        visibility: 'public',
        version: '1.0.0',
        license: 'MIT',
      },
      technical: {
        script_type: 'powershell',
        runtime: 'PowerShell 7',
        compatibility: 'Windows/Linux',
        dependencies: 'Az.Accounts',
      },
      source: {
        filename: 'audit-ressources-azure.ps1',
        content: '# Get-AzResource | Export-Csv',
      },
      documentation: {
        features: 'Collecte des ressources.',
        prerequisites: 'Azure module installé.',
        usage_example: '.\\audit.ps1',
        details: 'Script d audit de base.',
        notes: null,
      },
      assets: {
        screenshots: [],
      },
    },
  },
  {
    schema_version: '1.0.0',
    script: {
      metadata: {
        name: 'Backup S3',
        description: 'Script Bash pour backup buckets S3.',
        category_id: null,
        tags: ['aws', 's3', 'backup'],
        criticality: 'medium',
        status: 'draft',
        visibility: 'private',
        version: '0.9.0',
        license: 'Apache-2.0',
      },
      technical: {
        script_type: 'bash',
        runtime: 'bash',
        compatibility: 'Linux',
        dependencies: 'aws cli',
      },
      source: {
        filename: 'backup-s3.sh',
        content: '#!/bin/bash\naws s3 sync ...',
      },
      documentation: {
        features: 'Synchronisation de bucket',
        prerequisites: 'AWS CLI configuré',
        usage_example: './backup-s3.sh',
        details: null,
        notes: null,
      },
      assets: {
        screenshots: [],
      },
    },
  },
];

const statusBadge = (s: Status) => ({
  draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  archived: 'bg-muted text-muted-foreground border-border',
  deprecated: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}[s]);

const critBadge = (c: Criticality) => ({
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}[c]);

export default function ScriptsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, hasRole } = useAuth();
  const canWrite = hasRole('global_admin') || hasRole('admin') || hasRole('editor');
  const canDelete = hasRole('global_admin') || hasRole('admin');

  const [items, setItems] = useState<Script[]>([]);
  const [categories, setCategories] = useState<CategoryLite[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table' | 'cards'>('grid');

  // filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ScriptType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<'all' | Criticality>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | Visibility>('all');
  const [authorFilter, setAuthorFilter] = useState<'all' | string>('all');
  const [tagFilter, setTagFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // sorting
  const [sortKey, setSortKey] = useState<'updated_at' | 'created_at' | 'name' | 'downloads_count' | 'views_count' | 'average_rating'>('updated_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // pagination
  const [currentPage, setCurrentPage] = useState(1);

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Script | null>(null);
  const [form, setForm] = useState<Partial<Script>>(EMPTY_FORM);
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Script | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // export/import
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<{ line: number; message: string }[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('En attente');
  const [importSummary, setImportSummary] = useState<{ created: number; skipped: number; errors: number } | null>(null);
  const [importDoneOpen, setImportDoneOpen] = useState(false);

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateProgress, setTemplateProgress] = useState(0);
  const [templateDownloading, setTemplateDownloading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [scriptsRes, catsRes] = await Promise.all([
      supabase.from('scripts').select('*').order('updated_at', { ascending: false }),
      supabase.from('categories').select('id, name, color').order('name'),
    ]);
    if (scriptsRes.error) toast.error(scriptsRes.error.message);
    const data = (scriptsRes.data as Script[]) ?? [];
    setItems(data);
    setCategories((catsRes.data as CategoryLite[]) ?? []);
    // load author names
    const ids = Array.from(new Set(data.map((s) => s.author_id).filter(Boolean))) as string[];
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('id, name, email').in('id', ids);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p: any) => { map[p.id] = p.name || p.email; });
      setAuthors(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // load saved filters
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_FILTERS_KEY);
      if (raw) {
        const f = JSON.parse(raw);
        setSearch(f.search ?? '');
        setStatusFilter(f.statusFilter ?? 'all');
        setTypeFilter(f.typeFilter ?? 'all');
        setCategoryFilter(f.categoryFilter ?? 'all');
        setCriticalityFilter(f.criticalityFilter ?? 'all');
        setVisibilityFilter(f.visibilityFilter ?? 'all');
        setAuthorFilter(f.authorFilter ?? 'all');
        setTagFilter(f.tagFilter ?? '');
        setDateFrom(f.dateFrom ?? '');
        setDateTo(f.dateTo ?? '');
      }
    } catch {}
  }, []);

  const saveFilters = () => {
    const f = {
      search, statusFilter, typeFilter, categoryFilter, criticalityFilter,
      visibilityFilter, authorFilter, tagFilter, dateFrom, dateTo,
    };
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(f));
    toast.success('Filtres sauvegardés');
  };

  const resetFilters = () => {
    setSearch(''); setStatusFilter('all'); setTypeFilter('all');
    setCategoryFilter('all'); setCriticalityFilter('all');
    setVisibilityFilter('all'); setAuthorFilter('all'); setTagFilter('');
    setDateFrom(''); setDateTo('');
    localStorage.removeItem(SAVED_FILTERS_KEY);
    toast.success('Filtres réinitialisés');
  };

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((s) => s.status === 'active').length;
    const archived = items.filter((s) => s.status === 'archived').length;
    const critical = items.filter((s) => s.criticality === 'critical').length;
    const publicCount = items.filter((s) => s.visibility === 'public').length;
    const downloads = items.reduce((acc, s) => acc + (s.downloads_count || 0), 0);
    return { total, active, archived, critical, publicCount, downloads };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const tagQ = tagFilter.toLowerCase().trim();
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to = dateTo ? new Date(dateTo).getTime() + 86400000 : null;
    let res = items.filter((s) => {
      const matchQ = !q ||
        s.name.toLowerCase().includes(q) ||
        (s.description ?? '').toLowerCase().includes(q) ||
        (s.tags ?? []).some((t) => t.toLowerCase().includes(q));
      const matchS = statusFilter === 'all' || s.status === statusFilter;
      const matchT = typeFilter === 'all' || s.script_type === typeFilter;
      const matchC = categoryFilter === 'all' || s.category_id === categoryFilter;
      const matchCr = criticalityFilter === 'all' || s.criticality === criticalityFilter;
      const matchV = visibilityFilter === 'all' || s.visibility === visibilityFilter;
      const matchA = authorFilter === 'all' || s.author_id === authorFilter;
      const matchTag = !tagQ || (s.tags ?? []).some((t) => t.toLowerCase().includes(tagQ));
      const ts = new Date(s.updated_at).getTime();
      const matchDate = (!from || ts >= from) && (!to || ts <= to);
      return matchQ && matchS && matchT && matchC && matchCr && matchV && matchA && matchTag && matchDate;
    });
    res = [...res].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const va: any = (a as any)[sortKey];
      const vb: any = (b as any)[sortKey];
      if (typeof va === 'string') return va.localeCompare(vb) * dir;
      return ((va ?? 0) - (vb ?? 0)) * dir;
    });
    return res;
  }, [items, search, statusFilter, typeFilter, categoryFilter, criticalityFilter, visibilityFilter, authorFilter, tagFilter, dateFrom, dateTo, sortKey, sortDir]);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, typeFilter, categoryFilter, criticalityFilter, visibilityFilter, authorFilter, tagFilter, dateFrom, dateTo, view]);

  useEffect(() => {
    const categoryFromQuery = searchParams.get('category');
    if (categoryFromQuery && categoryFromQuery !== categoryFilter) {
      setCategoryFilter(categoryFromQuery);
    }
  }, [searchParams, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => { setSelectedIds([]); }, [currentPage, view, search]);
  useEffect(() => { setCurrentPage((p) => Math.min(p, totalPages)); }, [totalPages]);

  // ---- CRUD ----
  const openEdit = (s: Script) => navigate(`/scripts/${s.id}/edit`);

  const save = async () => {
    if (!form.name?.trim()) return toast.error('Le nom est requis');
    setSaving(true);
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const payload: any = {
      name: form.name!.trim(),
      description: form.description?.trim() || null,
      script_type: form.script_type ?? 'powershell',
      content: form.content ?? '',
      features: form.features?.trim() || null,
      prerequisites: form.prerequisites?.trim() || null,
      usage_example: form.usage_example?.trim() || null,
      criticality: form.criticality ?? 'medium',
      version: form.version?.trim() || '1.0.0',
      status: form.status ?? 'draft',
      tags,
      category_id: form.category_id || null,
      license: form.license?.trim() || null,
      language: form.language?.trim() || null,
      compatibility: form.compatibility?.trim() || null,
      dependencies: form.dependencies?.trim() || null,
      documentation: form.documentation?.trim() || null,
      visibility: form.visibility ?? 'private',
    };
    if (editing) {
      const { error } = await supabase.from('scripts').update(payload).eq('id', editing.id);
      if (error) { setSaving(false); return toast.error(error.message); }
      toast.success('Script mis à jour');
    } else {
      payload.author_id = user?.id ?? null;
      const { error } = await supabase.from('scripts').insert(payload);
      if (error) { setSaving(false); return toast.error(error.message); }
      toast.success('Script créé');
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const remove = async () => {
    if (!toDelete) return;
    const { moveToTrash } = await import('@/lib/trash');
    const t = await moveToTrash({ resourceType: 'script', rows: [toDelete] });
    if (!t.ok) return toast.error(t.error ?? 'Erreur');
    const { error } = await supabase.from('scripts').delete().eq('id', toDelete.id);
    if (error) return toast.error(error.message);
    toast.success('Script déplacé dans la corbeille');
    setToDelete(null);
    load();
  };

  const toggleStatus = async (s: Script) => {
    const next: Status = s.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('scripts').update({ status: next }).eq('id', s.id);
    if (error) return toast.error(error.message);
    toast.success(next === 'active' ? 'Activé' : 'Désactivé');
    load();
  };

  const toggleVisibility = async (s: Script) => {
    const next: Visibility = s.visibility === 'public' ? 'private' : 'public';
    const { error } = await supabase.from('scripts').update({ visibility: next }).eq('id', s.id);
    if (error) return toast.error(error.message);
    load();
  };

  const duplicate = async (s: Script) => {
    const { error } = await supabase.from('scripts').insert({
      name: `${s.name} (copie)`,
      description: s.description,
      script_type: s.script_type,
      content: s.content,
      features: s.features,
      prerequisites: s.prerequisites,
      usage_example: s.usage_example,
      criticality: s.criticality,
      version: s.version,
      status: 'draft',
      tags: s.tags,
      category_id: s.category_id,
      author_id: user?.id ?? null,
      license: s.license,
      language: s.language,
      compatibility: s.compatibility,
      dependencies: s.dependencies,
      documentation: s.documentation,
      visibility: s.visibility,
    });
    if (error) return toast.error(error.message);
    toast.success('Script dupliqué');
    load();
  };

  const archive = async (s: Script) => {
    const { error } = await supabase.from('scripts').update({ status: 'archived' as Status }).eq('id', s.id);
    if (error) return toast.error(error.message);
    toast.success('Archivé');
    load();
  };

  const selectAllOnPage = () => setSelectedIds(paginated.map((s) => s.id));
  const clearSelection = () => setSelectedIds([]);
  const toggleRow = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const archiveSelected = async () => {
    if (!selectedIds.length) return;
    const { error } = await supabase.from('scripts').update({ status: 'archived' as Status }).in('id', selectedIds);
    if (error) return toast.error(error.message);
    toast.success(`${selectedIds.length} archivé(s)`);
    setSelectedIds([]); load();
  };

  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    const rows = items.filter((s) => selectedIds.includes(s.id));
    const { moveToTrash } = await import('@/lib/trash');
    const t = await moveToTrash({ resourceType: 'script', rows });
    if (!t.ok) return toast.error(t.error ?? 'Erreur');
    const { error } = await supabase.from('scripts').delete().in('id', selectedIds);
    if (error) return toast.error(error.message);
    toast.success(`${selectedIds.length} déplacé(s) dans la corbeille`);
    setSelectedIds([]); setBulkDeleteOpen(false); load();
  };

  // ---- Export ----
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const toCsv = (rows: Script[]) => {
    const headers = ['id', 'name', 'description', 'script_type', 'criticality', 'version', 'status', 'visibility', 'tags', 'category', 'author', 'downloads', 'views', 'rating', 'created_at', 'updated_at'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? '';
    const lines = [
      headers.join(','),
      ...rows.map((s) => [
        s.id, s.name, s.description ?? '', s.script_type, s.criticality, s.version,
        s.status, s.visibility, (s.tags ?? []).join('|'), catName(s.category_id),
        authors[s.author_id ?? ''] ?? '', s.downloads_count, s.views_count,
        s.average_rating, s.created_at, s.updated_at,
      ].map(esc).join(',')),
    ];
    return lines.join('\n');
  };

  const exportScripts = async () => {
    if (!items.length) return toast.error('Aucun script à exporter');
    setExporting(true); setExportProgress(15);
    await new Promise((r) => setTimeout(r, 180));
    setExportProgress(45);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (exportFormat === 'csv') {
      const csv = toCsv(filtered);
      setExportProgress(90);
      triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `scripts-${stamp}.csv`);
      setExportProgress(100);
      setTimeout(() => { setExporting(false); setExportDialogOpen(false); toast.success('Export CSV terminé'); }, 250);
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 86, 'F');
    doc.setFontSize(20); doc.setTextColor(255, 255, 255);
    doc.text('Script Hub', 40, 42);
    doc.setFontSize(12); doc.setTextColor(191, 219, 254);
    doc.text('Export des scripts', 40, 64);
    doc.setTextColor(255, 255, 255);
    doc.text(`Date: ${new Date().toLocaleString('fr-FR')}`, doc.internal.pageSize.getWidth() - 230, 42);
    doc.text(`Total: ${filtered.length}`, doc.internal.pageSize.getWidth() - 230, 64);
    setExportProgress(70);

    const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? '—';
    autoTable(doc, {
      startY: 108,
      head: [['Nom', 'Type', 'Catégorie', 'Criticité', 'Statut', 'Visib.', 'Version', 'DL', 'MAJ']],
      body: filtered.map((s) => [
        s.name, s.script_type, catName(s.category_id), s.criticality, s.status,
        s.visibility, s.version, s.downloads_count,
        new Date(s.updated_at).toLocaleDateString('fr-FR'),
      ]),
      styles: { fontSize: 9, cellPadding: 6, textColor: [30, 41, 59] },
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 24, right: 24 },
      didDrawPage: () => {
        const pageCount = doc.getNumberOfPages();
        const cur = doc.getCurrentPageInfo().pageNumber;
        doc.setFontSize(9); doc.setTextColor(100);
        doc.text(`Page ${cur}/${pageCount}`, doc.internal.pageSize.getWidth() - 70, doc.internal.pageSize.getHeight() - 12);
      },
    });
    setExportProgress(95);
    doc.save(`scripts-${stamp}.pdf`);
    setExportProgress(100);
    setTimeout(() => { setExporting(false); setExportDialogOpen(false); toast.success('Export PDF terminé'); }, 300);
  };

  // ---- Import ----
  const downloadJsonTemplate = async () => {
    setTemplateDownloading(true); setTemplateProgress(20);
    await new Promise((r) => setTimeout(r, 200));
    setTemplateProgress(75);
    triggerDownload(new Blob([JSON.stringify(IMPORT_SAMPLE, null, 2)], { type: 'application/json' }), 'scripts-template.json');
    setTemplateProgress(100);
    setTimeout(() => {
      setTemplateDownloading(false); setTemplateDialogOpen(false);
      toast.success('Modèle JSON téléchargé');
    }, 250);
  };

  const normalizeScript = (entry: any, line: number) => {
    if (!entry || typeof entry !== 'object') return { error: { line, message: 'Objet attendu' } };
    const normalized = entry?.script && typeof entry.script === 'object'
      ? {
          name: entry.script?.metadata?.name,
          description: entry.script?.metadata?.description,
          script_type: entry.script?.technical?.script_type,
          content: entry.script?.source?.content,
          criticality: entry.script?.metadata?.criticality,
          version: entry.script?.metadata?.version,
          status: entry.script?.metadata?.status,
          tags: entry.script?.metadata?.tags,
          visibility: entry.script?.metadata?.visibility,
          license: entry.script?.metadata?.license,
          language: entry.script?.technical?.runtime,
          compatibility: entry.script?.technical?.compatibility,
          dependencies: entry.script?.technical?.dependencies,
          documentation: entry.script?.documentation?.details,
          features: entry.script?.documentation?.features,
          prerequisites: entry.script?.documentation?.prerequisites,
          usage_example: entry.script?.documentation?.usage_example,
          category_id: entry.script?.metadata?.category_id,
        }
      : entry;
    if (!normalized.name || typeof normalized.name !== 'string' || normalized.name.trim().length < 2) {
      return { error: { line, message: 'Nom invalide (min 2 caractères)' } };
    }
    const validTypes = SCRIPT_TYPES.map((t) => t.value);
    const type = String(normalized.script_type ?? 'other');
    if (!validTypes.includes(type as any)) return { error: { line, message: `Type invalide: ${type}` } };
    return {
      parsed: {
        line,
        name: normalized.name.trim(),
        description: normalized.description ?? null,
        script_type: type as ScriptType,
        content: normalized.content ?? '',
        criticality: ['low', 'medium', 'high', 'critical'].includes(normalized.criticality) ? normalized.criticality : 'medium',
        version: normalized.version ?? '1.0.0',
        status: ['draft', 'active', 'inactive', 'archived', 'deprecated'].includes(normalized.status) ? normalized.status : 'draft',
        tags: Array.isArray(normalized.tags) ? normalized.tags : [],
        visibility: normalized.visibility === 'public' ? 'public' : 'private',
        license: normalized.license ?? null,
        language: normalized.language ?? null,
        compatibility: normalized.compatibility ?? null,
        dependencies: normalized.dependencies ?? null,
        documentation: normalized.documentation ?? null,
        features: normalized.features ?? null,
        prerequisites: normalized.prerequisites ?? null,
        usage_example: normalized.usage_example ?? null,
        category_id: normalized.category_id ?? null,
      },
    };
  };

  const onFilePicked = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.json')) {
      toast.error('Veuillez sélectionner un fichier JSON');
      return;
    }
    setImportFileName(file.name);
    setImportErrors([]); setImportSummary(null);
    const text = await file.text();
    let parsedRaw: unknown;
    try { parsedRaw = JSON.parse(text); }
    catch {
      setImportPreview([]);
      setImportErrors([{ line: 1, message: 'JSON invalide (syntaxe)' }]);
      return;
    }
    const list = Array.isArray(parsedRaw) ? parsedRaw : [parsedRaw];
    const preview: any[] = []; const errs: { line: number; message: string }[] = [];
    list.forEach((entry, idx) => {
      const r = normalizeScript(entry, idx + 1);
      if ((r as any).error) errs.push((r as any).error);
      if ((r as any).parsed) preview.push((r as any).parsed);
    });
    setImportPreview(preview); setImportErrors(errs);
    if (preview.length) toast.success(`${preview.length} script(s) détecté(s)`);
  };

  const importJson = async () => {
    if (!importPreview.length) return toast.error('Aucun script valide à importer');
    setImporting(true); setImportProgress(0); setImportStatus('Initialisation...');
    let created = 0, skipped = 0;
    const errs = [...importErrors];
    const known = new Set(items.map((s) => s.name.toLowerCase()));
    for (let i = 0; i < importPreview.length; i++) {
      const row = importPreview[i];
      setImportStatus(`Traitement ligne ${row.line}...`);
      if (known.has(row.name.toLowerCase())) {
        skipped++;
        errs.push({ line: row.line, message: `Doublon: "${row.name}"` });
        setImportProgress(Math.round(((i + 1) / importPreview.length) * 100));
        continue;
      }
      const { error } = await supabase.from('scripts').insert({
        name: row.name, description: row.description, script_type: row.script_type,
        content: row.content, criticality: row.criticality, version: row.version,
        status: row.status, tags: row.tags, visibility: row.visibility,
        license: row.license, language: row.language, compatibility: row.compatibility,
        dependencies: row.dependencies, documentation: row.documentation,
        features: row.features, prerequisites: row.prerequisites, usage_example: row.usage_example,
        category_id: row.category_id, author_id: user?.id ?? null,
      });
      if (error) errs.push({ line: row.line, message: error.message });
      else { created++; known.add(row.name.toLowerCase()); }
      setImportProgress(Math.round(((i + 1) / importPreview.length) * 100));
    }
    setImportErrors(errs);
    setImportSummary({ created, skipped, errors: errs.length });
    setImporting(false); setImportStatus('Terminé');
    if (created) { toast.success(`${created} script(s) créé(s)`); await load(); setImportDoneOpen(true); }
    else toast.error('Aucun script créé');
  };

  const resetImport = () => {
    setImportFileName(''); setImportPreview([]); setImportErrors([]);
    setImportSummary(null); setImportProgress(0); setImporting(false); setImportStatus('En attente');
  };

  const catLookup = useMemo(() => {
    const m: Record<string, CategoryLite> = {};
    categories.forEach((c) => { m[c.id] = c; });
    return m;
  }, [categories]);

  const uniqueAuthorIds = useMemo(() => Array.from(new Set(items.map((s) => s.author_id).filter(Boolean))) as string[], [items]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <header className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Bibliothèque de Scripts</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Centralisez, documentez et gouvernez vos scripts cloud.
              </p>
            </div>
            {canWrite && (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => load()}>
                  <RefreshCw className="h-4 w-4" /> Rafraîchir
                </Button>
                <Button variant="outline" onClick={() => setTemplateDialogOpen(true)}>
                  <FileJson className="h-4 w-4" /> Modèle JSON
                </Button>
                <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                  <Upload className="h-4 w-4" /> Importer JSON
                </Button>
                <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
                  <Download className="h-4 w-4" /> Télécharger
                </Button>
                <Button asChild>
                  <Link to="/scripts/new">
                    <Plus className="h-4 w-4" /> Nouveau script
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard label="Total" value={stats.total} icon={FileCode} accent="bg-blue-500/10 text-blue-400" delay={0} />
          <StatCard label="Actifs" value={stats.active} icon={CheckCircle2} accent="bg-emerald-500/10 text-emerald-400" delay={70} />
          <StatCard label="Archivés" value={stats.archived} icon={Archive} accent="bg-muted text-muted-foreground" delay={140} />
          <StatCard label="Critiques" value={stats.critical} icon={AlertTriangle} accent="bg-rose-500/10 text-rose-400" delay={210} />
          <StatCard label="Publics" value={stats.publicCount} icon={Globe} accent="bg-violet-500/10 text-violet-400" delay={280} />
          <StatCard label="Téléchargements" value={stats.downloads} icon={Download} accent="bg-amber-500/10 text-amber-400" delay={350} />
        </section>

        {/* Filters */}
        <div className="space-y-3 rounded-xl border border-border/60 bg-card p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher (nom, description, tags)..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
                <SelectItem value="deprecated">Déprécié</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                {SCRIPT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
              <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setAdvancedOpen((o) => !o)}>
              <Filter className="h-4 w-4" /> Avancé
            </Button>
            <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
              <Select value={`${sortKey}:${sortDir}`} onValueChange={(v) => {
                const [k, d] = v.split(':') as any; setSortKey(k); setSortDir(d);
              }}>
                <SelectTrigger className="w-[180px] border-0 h-8"><ArrowUpDown className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated_at:desc">MAJ (récent)</SelectItem>
                  <SelectItem value="updated_at:asc">MAJ (ancien)</SelectItem>
                  <SelectItem value="created_at:desc">Créé (récent)</SelectItem>
                  <SelectItem value="name:asc">Nom (A-Z)</SelectItem>
                  <SelectItem value="name:desc">Nom (Z-A)</SelectItem>
                  <SelectItem value="downloads_count:desc">Téléchargements</SelectItem>
                  <SelectItem value="views_count:desc">Vues</SelectItem>
                  <SelectItem value="average_rating:desc">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center rounded-md border border-border bg-background p-1">
              <button onClick={() => setView('grid')} className={`p-1.5 rounded ${view === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`} aria-label="Grille"><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setView('cards')} className={`p-1.5 rounded ${view === 'cards' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`} aria-label="Cards"><List className="h-4 w-4" /></button>
              <button onClick={() => setView('table')} className={`p-1.5 rounded ${view === 'table' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`} aria-label="Tableau"><Table2 className="h-4 w-4" /></button>
            </div>
          </div>
          {advancedOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border/60 animate-fade-in">
              <div className="space-y-1">
                <Label className="text-xs">Criticité</Label>
                <Select value={criticalityFilter} onValueChange={(v) => setCriticalityFilter(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Visibilité</Label>
                <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Auteur</Label>
                <Select value={authorFilter} onValueChange={(v) => setAuthorFilter(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    {uniqueAuthorIds.map((id) => <SelectItem key={id} value={id}>{authors[id] ?? id.slice(0, 8)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tag contient</Label>
                <Input value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} placeholder="Ex: azure" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Modifié depuis</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Modifié jusqu'à</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex items-end gap-2">
                <Button variant="outline" size="sm" onClick={saveFilters}><Save className="h-4 w-4" /> Sauvegarder filtres</Button>
                <Button variant="ghost" size="sm" onClick={resetFilters}>Réinitialiser</Button>
              </div>
            </div>
          )}
        </div>

        {/* Bulk actions */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2">
          <Button variant="outline" size="sm" onClick={selectAllOnPage}>Sélectionner tout</Button>
          <Button variant="outline" size="sm" onClick={clearSelection}>Désélectionner</Button>
          <Button variant="outline" size="sm" onClick={archiveSelected} disabled={!selectedIds.length}>
            <Archive className="h-4 w-4" /> Archiver
          </Button>
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)} disabled={!selectedIds.length}>
              <Trash2 className="h-4 w-4" /> Supprimer
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {selectedIds.length} sélectionné(s) · {filtered.length} résultat(s)
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState canCreate={canWrite} />
        ) : view === 'grid' ? (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((s) => (
              <ScriptGridCard
                key={s.id} s={s} cat={s.category_id ? catLookup[s.category_id] : undefined}
                authorName={s.author_id ? authors[s.author_id] : undefined}
                selected={selectedIds.includes(s.id)} onToggleSelect={() => toggleRow(s.id)}
                canWrite={canWrite} canDelete={canDelete}
                onEdit={() => openEdit(s)} onDelete={() => setToDelete(s)}
                onToggleStatus={() => toggleStatus(s)} onToggleVisibility={() => toggleVisibility(s)}
                onDuplicate={() => duplicate(s)} onArchive={() => archive(s)}
              />
            ))}
          </section>
        ) : view === 'cards' ? (
          <section className="flex flex-col gap-3">
            {paginated.map((s) => (
              <ScriptListCard
                key={s.id} s={s} cat={s.category_id ? catLookup[s.category_id] : undefined}
                authorName={s.author_id ? authors[s.author_id] : undefined}
                selected={selectedIds.includes(s.id)} onToggleSelect={() => toggleRow(s.id)}
                canWrite={canWrite} canDelete={canDelete}
                onEdit={() => openEdit(s)} onDelete={() => setToDelete(s)}
                onToggleStatus={() => toggleStatus(s)} onToggleVisibility={() => toggleVisibility(s)}
                onDuplicate={() => duplicate(s)} onArchive={() => archive(s)}
              />
            ))}
          </section>
        ) : (
          <ScriptTable
            items={paginated} categories={catLookup} authors={authors}
            selectedIds={selectedIds} onToggleSelect={toggleRow}
            canWrite={canWrite} canDelete={canDelete}
            onEdit={openEdit} onDelete={setToDelete}
            onToggleStatus={toggleStatus} onToggleVisibility={toggleVisibility}
            onDuplicate={duplicate} onArchive={archive}
          />
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Affichage de <span className="font-medium text-foreground">{paginated.length}</span> sur{' '}
              <span className="font-medium text-foreground">{filtered.length}</span> scripts
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" /> Précédent
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page <span className="font-medium text-foreground">{currentPage}</span> / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                Suivant <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le script' : 'Nouveau script'}</DialogTitle>
            <DialogDescription>Renseignez les informations du script.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            {/* Left col */}
            <div className="space-y-4 rounded-lg border border-border/60 bg-card/60 p-4">
              <h4 className="text-sm font-semibold">Informations</h4>
              <div className="space-y-1.5">
                <Label>Nom *</Label>
                <Input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Backup Azure VM" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Type *</Label>
                  <Select value={form.script_type ?? 'powershell'} onValueChange={(v) => setForm({ ...form, script_type: v as ScriptType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SCRIPT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Catégorie</Label>
                  <Select value={form.category_id ?? 'none'} onValueChange={(v) => setForm({ ...form, category_id: v === 'none' ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Criticité</Label>
                  <Select value={form.criticality ?? 'medium'} onValueChange={(v) => setForm({ ...form, criticality: v as Criticality })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Statut</Label>
                  <Select value={form.status ?? 'draft'} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                      <SelectItem value="deprecated">Déprécié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Visibilité</Label>
                  <Select value={form.visibility ?? 'private'} onValueChange={(v) => setForm({ ...form, visibility: v as Visibility })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Privé</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Version</Label>
                  <Input value={form.version ?? ''} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="1.0.0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Licence</Label>
                  <Input value={form.license ?? ''} onChange={(e) => setForm({ ...form, license: e.target.value })} placeholder="MIT" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Tags (séparés par virgule)</Label>
                <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="azure, backup, vm" />
              </div>
            </div>

            {/* Right col */}
            <div className="space-y-4 rounded-lg border border-border/60 bg-card/60 p-4">
              <h4 className="text-sm font-semibold">Contenu & documentation</h4>
              <div className="space-y-1.5">
                <Label>Code source</Label>
                <Textarea rows={6} value={form.content ?? ''} onChange={(e) => setForm({ ...form, content: e.target.value })} className="font-mono text-xs" placeholder="# Votre code ici" />
              </div>
              <div className="space-y-1.5">
                <Label>Fonctionnalités</Label>
                <Textarea rows={2} value={form.features ?? ''} onChange={(e) => setForm({ ...form, features: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Prérequis</Label>
                <Textarea rows={2} value={form.prerequisites ?? ''} onChange={(e) => setForm({ ...form, prerequisites: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Exemple d'utilisation</Label>
                <Textarea rows={2} value={form.usage_example ?? ''} onChange={(e) => setForm({ ...form, usage_example: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Langage</Label>
                  <Input value={form.language ?? ''} onChange={(e) => setForm({ ...form, language: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Compatibilité</Label>
                  <Input value={form.compatibility ?? ''} onChange={(e) => setForm({ ...form, compatibility: e.target.value })} placeholder="PS 7+" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Dépendances</Label>
                <Input value={form.dependencies ?? ''} onChange={(e) => setForm({ ...form, dependencies: e.target.value })} placeholder="Az.Accounts >= 2.0" />
              </div>
              <div className="space-y-1.5">
                <Label>Documentation</Label>
                <Textarea rows={2} value={form.documentation ?? ''} onChange={(e) => setForm({ ...form, documentation: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {editing ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export */}
      <Dialog open={exportDialogOpen} onOpenChange={(o) => { if (!exporting) setExportDialogOpen(o); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Exporter les scripts</DialogTitle>
            <DialogDescription>Choisissez le format d'export ({filtered.length} script(s) filtrés).</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {(['pdf', 'csv'] as const).map((f) => (
              <button key={f} onClick={() => setExportFormat(f)}
                className={`rounded-lg border-2 p-4 text-left transition ${exportFormat === f ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <Download className="h-5 w-5 mb-2" />
                <p className="font-semibold uppercase">{f}</p>
                <p className="text-xs text-muted-foreground">{f === 'pdf' ? 'Rapport PDF' : 'Données CSV'}</p>
              </button>
            ))}
          </div>
          {exporting && <Progress value={exportProgress} className="h-2" />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)} disabled={exporting}>Annuler</Button>
            <Button onClick={exportScripts} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template */}
      <Dialog open={templateDialogOpen} onOpenChange={(o) => { if (!templateDownloading) setTemplateDialogOpen(o); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Télécharger le modèle JSON</DialogTitle>
            <DialogDescription>Un fichier d'exemple pour préparer un import en masse.</DialogDescription>
          </DialogHeader>
          {templateDownloading && <Progress value={templateProgress} className="h-2" />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)} disabled={templateDownloading}>Annuler</Button>
            <Button onClick={downloadJsonTemplate} disabled={templateDownloading}>
              {templateDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson className="h-4 w-4" />} Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import */}
      <Dialog open={importDialogOpen} onOpenChange={(o) => { setImportDialogOpen(o); if (!o) resetImport(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importer des scripts (JSON)</DialogTitle>
            <DialogDescription>Glissez-déposez ou sélectionnez un fichier JSON.</DialogDescription>
          </DialogHeader>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setIsDragging(false);
              const f = e.dataTransfer.files?.[0]; if (f) onFilePicked(f);
            }}
            className={`rounded-lg border-2 border-dashed p-6 text-center transition ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm">Glissez un fichier JSON ici</p>
            <p className="text-xs text-muted-foreground my-2">ou</p>
            <input ref={fileInputRef} type="file" accept=".json,application/json" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFilePicked(f); }} />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Parcourir</Button>
            {importFileName && <p className="mt-2 text-xs text-muted-foreground">📄 {importFileName}</p>}
          </div>
          {importPreview.length > 0 && (
            <div className="rounded-lg border border-border/60 p-3 max-h-48 overflow-y-auto">
              <p className="text-xs text-muted-foreground mb-2">{importPreview.length} script(s) prêt(s)</p>
              <ul className="text-xs space-y-1">
                {importPreview.slice(0, 10).map((p) => (
                  <li key={p.line} className="flex items-center justify-between">
                    <span>L{p.line} · {p.name}</span>
                    <Badge variant="outline">{p.script_type}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {importErrors.length > 0 && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 max-h-32 overflow-y-auto">
              <p className="text-xs font-semibold text-destructive mb-1">{importErrors.length} erreur(s)</p>
              <ul className="text-xs text-destructive space-y-0.5">
                {importErrors.slice(0, 10).map((e, i) => <li key={i}>L{e.line}: {e.message}</li>)}
              </ul>
            </div>
          )}
          {importing && (
            <div className="space-y-2">
              <Progress value={importProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">{importStatus}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)} disabled={importing}>Fermer</Button>
            <Button onClick={importJson} disabled={importing || !importPreview.length}>
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Importer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importDoneOpen} onOpenChange={setImportDoneOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Importation terminée</DialogTitle>
            <DialogDescription>
              {importSummary && <span>Créés: {importSummary.created} | Ignorés: {importSummary.skipped} | Erreurs: {importSummary.errors}</span>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter><Button onClick={() => setImportDoneOpen(false)}>Fermer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirms */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le script ?</AlertDialogTitle>
            <AlertDialogDescription>
              Action définitive. Le script « {toDelete?.name} » sera supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la sélection ?</AlertDialogTitle>
            <AlertDialogDescription>{selectedIds.length} script(s) seront supprimés définitivement.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

// ============== Sub-components ==============

function StatCard({ label, value, icon: Icon, accent, delay = 0 }: { label: string; value: number; icon: any; accent: string; delay?: number }) {
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

function EmptyState({ canCreate }: { canCreate?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/40 py-16 px-6 text-center animate-fade-in">
      <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">Aucun script</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">Commencez par créer votre premier script ou importez un lot via JSON.</p>
      {canCreate && (
        <Button asChild className="mt-4">
          <Link to="/scripts/new"><Plus className="h-4 w-4" /> Nouveau script</Link>
        </Button>
      )}
    </div>
  );
}

function ActionsMenu({ s, canWrite, canDelete, onEdit, onDelete, onToggleStatus, onToggleVisibility, onDuplicate, onArchive }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowUpRight className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canWrite && <DropdownMenuItem onClick={onEdit} className="gap-2"><Edit3 className="h-4 w-4" /> Modifier</DropdownMenuItem>}
        {canWrite && <DropdownMenuItem onClick={onToggleStatus} className="gap-2"><Sparkles className="h-4 w-4" /> {s.status === 'active' ? 'Désactiver' : 'Activer'}</DropdownMenuItem>}
        {canWrite && <DropdownMenuItem onClick={onToggleVisibility} className="gap-2">{s.visibility === 'public' ? <><Lock className="h-4 w-4" /> Rendre privé</> : <><Globe className="h-4 w-4" /> Rendre public</>}</DropdownMenuItem>}
        {canWrite && <DropdownMenuItem onClick={onDuplicate} className="gap-2"><Copy className="h-4 w-4" /> Dupliquer</DropdownMenuItem>}
        {canWrite && <DropdownMenuItem onClick={onArchive} className="gap-2"><Archive className="h-4 w-4" /> Archiver</DropdownMenuItem>}
        {canDelete && <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive"><Trash2 className="h-4 w-4" /> Supprimer</DropdownMenuItem>
        </>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ScriptGridCard({ s, cat, authorName, selected, onToggleSelect, ...actions }: any) {
  return (
    <div className={`group rounded-xl border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all hover:-translate-y-0.5 ${selected ? 'border-primary ring-1 ring-primary/30' : 'border-border/60'}`}>
      <div className="h-1.5" style={{ backgroundColor: cat?.color ?? 'hsl(var(--primary))' }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <input type="checkbox" checked={selected} onChange={onToggleSelect} className="h-4 w-4 rounded border-border" />
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileCode className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <Link to={`/script/${s.id}`} className="font-semibold text-foreground truncate hover:text-primary block">{s.name}</Link>
              <p className="text-xs text-muted-foreground">{s.script_type} · v{s.version}</p>
            </div>
          </div>
          <ActionsMenu s={s} {...actions} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{s.description || 'Aucune description'}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="outline" className={statusBadge(s.status)}>{s.status}</Badge>
          <Badge variant="outline" className={critBadge(s.criticality)}>{s.criticality}</Badge>
          {cat && <Badge variant="outline" style={{ color: cat.color, borderColor: `${cat.color}55` }}>{cat.name}</Badge>}
          {s.visibility === 'public' ? <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20"><Globe className="h-3 w-3 mr-1" />Public</Badge> : <Badge variant="outline"><Lock className="h-3 w-3 mr-1" />Privé</Badge>}
        </div>
        {s.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {s.tags.slice(0, 4).map((t: string) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"><Tag className="h-2.5 w-2.5 inline mr-0.5" />{t}</span>)}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Download className="h-3 w-3" />{s.downloads_count}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{s.views_count}</span>
            <span className="flex items-center gap-1"><Star className="h-3 w-3" />{Number(s.average_rating).toFixed(1)}</span>
          </span>
          <span className="truncate ml-2">{authorName ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}

function ScriptListCard({ s, cat, authorName, selected, onToggleSelect, ...actions }: any) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border bg-card p-4 hover:border-primary/40 transition-all ${selected ? 'border-primary ring-1 ring-primary/30' : 'border-border/60'}`}>
      <input type="checkbox" checked={selected} onChange={onToggleSelect} className="h-4 w-4 rounded border-border" />
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <FileCode className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link to={`/script/${s.id}`} className="font-semibold truncate hover:text-primary">{s.name}</Link>
          <Badge variant="outline" className={statusBadge(s.status)}>{s.status}</Badge>
          <Badge variant="outline" className={critBadge(s.criticality)}>{s.criticality}</Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{s.description || '—'}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          <span>{s.script_type} · v{s.version}</span>
          {cat && <span style={{ color: cat.color }}>● {cat.name}</span>}
          <span>{authorName ?? '—'}</span>
          <span><Download className="h-3 w-3 inline" /> {s.downloads_count}</span>
        </div>
      </div>
      <ActionsMenu s={s} {...actions} />
    </div>
  );
}

function ScriptTable({ items, categories, authors, selectedIds, onToggleSelect, canWrite, canDelete, onEdit, onDelete, onToggleStatus, onToggleVisibility, onDuplicate, onArchive }: any) {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">✓</th>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Catégorie</th>
              <th className="px-4 py-3 text-left">Criticité</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Visib.</th>
              <th className="px-4 py-3 text-left">Auteur</th>
              <th className="px-4 py-3 text-left">MAJ</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s: Script) => {
              const cat = s.category_id ? categories[s.category_id] : null;
              return (
                <tr key={s.id} className="border-t border-border/60 hover:bg-secondary/30 transition">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => onToggleSelect(s.id)} className="h-4 w-4 rounded border-border" />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/script/${s.id}`} className="font-medium hover:text-primary">{s.name}</Link>
                    <div className="text-[11px] text-muted-foreground">v{s.version}</div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline">{s.script_type}</Badge></td>
                  <td className="px-4 py-3">{cat ? <span style={{ color: cat.color }}>● {cat.name}</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={critBadge(s.criticality)}>{s.criticality}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="outline" className={statusBadge(s.status)}>{s.status}</Badge></td>
                  <td className="px-4 py-3">{s.visibility === 'public' ? <Globe className="h-4 w-4 text-violet-400" /> : <Lock className="h-4 w-4 text-muted-foreground" />}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.author_id ? (authors[s.author_id] ?? '—') : '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(s.updated_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-right">
                    <ActionsMenu s={s} canWrite={canWrite} canDelete={canDelete}
                      onEdit={() => onEdit(s)} onDelete={() => onDelete(s)}
                      onToggleStatus={() => onToggleStatus(s)} onToggleVisibility={() => onToggleVisibility(s)}
                      onDuplicate={() => onDuplicate(s)} onArchive={() => onArchive(s)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
