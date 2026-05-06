import { useEffect, useState, useMemo } from 'react';
import {
  ScrollText,
  Search,
  Loader2,
  Eye,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Users,
  Shield,
  Zap,
  Download,
  FileText,
  FileSpreadsheet,
  LogIn,
  LogOut,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit,
  Ban,
  RotateCw,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Log {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  details: any;
  ip_address: string | null;
  created_at: string;
}

const ACTION_ICONS: Record<string, any> = {
  login: LogIn,
  logout: LogOut,
  password_reset: KeyRound,
  first_password_set: KeyRound,
  force_password_reset: KeyRound,
  invite: UserPlus,
  update_roles: ShieldCheck,
  suspend: Ban,
  reactivate: RotateCw,
  delete: Trash2,
  update: Edit,
};

const ACTION_TONES: Record<string, string> = {
  login: 'text-success',
  logout: 'text-muted-foreground',
  password_reset: 'text-primary',
  first_password_set: 'text-primary',
  force_password_reset: 'text-warning',
  invite: 'text-success',
  update_roles: 'text-warning',
  suspend: 'text-destructive',
  reactivate: 'text-success',
  delete: 'text-destructive',
};
const PAGE_SIZE = 10;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [resource, setResource] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [openView, setOpenView] = useState<Log | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ mode: 'single' | 'bulk'; ids: string[] } | null>(null);
  const [openExport, setOpenExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [openExportSuccess, setOpenExportSuccess] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'selected' | 'date-range' | 'week' | 'month'>('all');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    setLogs((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const resources = useMemo(() => Array.from(new Set(logs.map((l) => l.resource))), [logs]);

  const filtered = logs.filter((l) => {
    const matchSearch =
      !search ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.user_email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase());
    const matchRes = resource === 'all' || l.resource === resource;
    return matchSearch && matchRes;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedLogs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedInFiltered = selectedIds.filter((id) => filtered.some((l) => l.id === id));
  const allPageSelected = paginatedLogs.length > 0 && paginatedLogs.every((l) => selectedIds.includes(l.id));
  const loginActions = filtered.filter((l) => l.action === 'login').length;
  const criticalActions = filtered.filter((l) => ['delete', 'suspend'].includes(l.action)).length;
  const uniqueActors = new Set(filtered.map((l) => l.user_email ?? 'system')).size;

  useEffect(() => {
    setPage(1);
  }, [search, resource]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id));
  };

  const selectAllFiltered = () => {
    setSelectedIds(Array.from(new Set([...selectedIds, ...filtered.map((l) => l.id)])));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const toggleSelectCurrentPage = (checked: boolean) => {
    if (checked) {
      setSelectedIds(Array.from(new Set([...selectedIds, ...paginatedLogs.map((l) => l.id)])));
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => !paginatedLogs.some((l) => l.id === id)));
  };

  const runDelete = async (ids: string[]) => {
    if (ids.length === 0) return;

    setSubmitting(true);
    const { error } = await supabase.from('audit_logs').delete().in('id', ids);
    setSubmitting(false);

    if (error) {
      toast.error('Suppression impossible', { description: error.message });
      return;
    }

    toast.success(ids.length > 1 ? `${ids.length} log(s) supprimé(s)` : 'Log supprimé');
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    await loadLogs();
  };

  const requestDeleteSelected = async () => {
    if (selectedInFiltered.length === 0) {
      toast.error('Aucun log sélectionné');
      return;
    }
    setConfirmDelete({ mode: 'bulk', ids: selectedInFiltered });
  };

  const requestDeleteOne = async (id: string) => {
    setConfirmDelete({ mode: 'single', ids: [id] });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    await runDelete(confirmDelete.ids);
    setConfirmDelete(null);
  };

  const formatDetails = (details: unknown) => {
    if (!details || typeof details !== 'object' || Object.keys(details as Record<string, unknown>).length === 0) return '—';
    return JSON.stringify(details);
  };

  const getScopeLabelFr = () => {
    switch (exportScope) {
      case 'all':
        return 'Tous les logs';
      case 'selected':
        return 'Logs selectionnes';
      case 'date-range':
        return 'Intervalle de dates';
      case 'week':
        return 'Semaine precise';
      case 'month':
        return 'Mois precis';
      default:
        return exportScope;
    }
  };

  const getLogsForExport = () => {
    const source = filtered;
    if (exportScope === 'all') return source;
    if (exportScope === 'selected') return source.filter((l) => selectedIds.includes(l.id));
    if (exportScope === 'date-range') {
      if (!rangeStart || !rangeEnd) return [];
      const start = new Date(`${rangeStart}T00:00:00`).getTime();
      const end = new Date(`${rangeEnd}T23:59:59`).getTime();
      return source.filter((l) => {
        const t = new Date(l.created_at).getTime();
        return t >= start && t <= end;
      });
    }
    if (exportScope === 'week') {
      if (!selectedWeek) return [];
      const [yearPart, weekPart] = selectedWeek.split('-W');
      const year = Number(yearPart);
      const week = Number(weekPart);
      if (!year || !week) return [];
      const jan4 = new Date(Date.UTC(year, 0, 4));
      const jan4Day = jan4.getUTCDay() || 7;
      const weekStart = new Date(jan4);
      weekStart.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
      return source.filter((l) => {
        const d = new Date(l.created_at);
        return d >= weekStart && d <= new Date(weekEnd.getTime() + 24 * 60 * 60 * 1000 - 1);
      });
    }
    if (exportScope === 'month') {
      if (!selectedMonth) return [];
      const [y, m] = selectedMonth.split('-').map(Number);
      if (!y || !m) return [];
      return source.filter((l) => {
        const d = new Date(l.created_at);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      });
    }
    return source;
  };

  const downloadCsv = (dataset: Log[]) => {
    const headers = ['Date', 'Acteur', 'Action', 'Ressource', 'Resource ID', 'IP', 'Details'];
    const rows = dataset.map((l) => [
      new Date(l.created_at).toLocaleString('fr-FR'),
      l.user_email ?? 'systeme',
      l.action,
      l.resource,
      l.resource_id ?? '',
      l.ip_address ?? '',
      formatDetails(l.details),
    ]);

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsv(String(cell))).join(';'))
      .join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = (dataset: Log[]) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const generatedAt = new Date().toLocaleString('fr-FR');

    doc.setFillColor(13, 20, 38);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 90, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Azure Hub Script - Rapport Logs & Audit', 40, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le: ${generatedAt}`, 40, 62);
    doc.text(`Total lignes: ${dataset.length}`, 210, 62);
    doc.text(`Filtre ressource: ${resource === 'all' ? 'Toutes' : resource}`, 330, 62);
    doc.text(`Périmètre: ${getScopeLabelFr()}`, 500, 62);

    autoTable(doc, {
      startY: 110,
      head: [['Date', 'Acteur', 'Action', 'Ressource', 'Resource ID', 'IP', 'Details']],
      body: dataset.map((l) => [
        new Date(l.created_at).toLocaleString('fr-FR'),
        l.user_email ?? 'systeme',
        l.action,
        l.resource,
        l.resource_id ?? '—',
        l.ip_address ?? '—',
        formatDetails(l.details),
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 5,
        overflow: 'linebreak',
        lineColor: [226, 232, 240],
        lineWidth: 0.4,
      },
      headStyles: {
        fillColor: [28, 45, 90],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 130 },
        2: { cellWidth: 90 },
        3: { cellWidth: 90 },
        4: { cellWidth: 95 },
        5: { cellWidth: 80 },
        6: { cellWidth: 170 },
      },
      didDrawPage: (data) => {
        const pageSize = doc.internal.pageSize;
        const pageNumber = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(
          `Azure Script Hub - Audit Export - Page ${pageNumber}`,
          pageSize.getWidth() - 230,
          pageSize.getHeight() - 20
        );
        doc.text(`PLG - 2026 PARIS ESTIAM GROUPE 24 CLOUD HUB SCRIPT`, 40, pageSize.getHeight() - 20);
      },
    });

    doc.save(`audit-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);
  };

  const handleExport = async (type: 'csv' | 'pdf') => {
    const dataset = getLogsForExport();
    if (dataset.length === 0) {
      toast.error('Aucune donnee a exporter');
      return;
    }

    setExporting(true);
    setExportProgress(15);
    try {
      setExportProgress(45);
      if (type === 'csv') downloadCsv(dataset);
      else downloadPdf(dataset);
      setExportProgress(100);
      setOpenExport(false);
      setOpenExportSuccess(true);
      toast.success(`Export ${type.toUpperCase()} termine`);
    } catch (error) {
      toast.error('Export impossible', { description: (error as Error).message });
    } finally {
      window.setTimeout(() => setExportProgress(0), 400);
      setExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <header className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ScrollText className="h-6 w-6 text-primary" />
                Logs & Audit
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Historique des actions critiques sur la plateforme.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10">
            <div className="absolute right-0 top-0 h-16 w-16 -translate-y-4 translate-x-4 rounded-full bg-primary/15 blur-xl" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Logs filtrés</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{filtered.length}</p>
              </div>
              <div className="rounded-lg border border-primary/25 bg-primary/10 p-2 text-primary">
                <ScrollText className="h-4 w-4" />
              </div>
            </div>
          </article>
          <article className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-success/10 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-success/40 hover:shadow-md">
            <div className="absolute right-0 top-0 h-16 w-16 -translate-y-4 translate-x-4 rounded-full bg-success/20 blur-xl" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Connexions</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-success">{loginActions}</p>
              </div>
              <div className="rounded-lg border border-success/25 bg-success/10 p-2 text-success">
                <Users className="h-4 w-4" />
              </div>
            </div>
          </article>
          <article className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-warning/10 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-warning/40 hover:shadow-md">
            <div className="absolute right-0 top-0 h-16 w-16 -translate-y-4 translate-x-4 rounded-full bg-warning/20 blur-xl" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Acteurs uniques</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-warning">{uniqueActors}</p>
              </div>
              <div className="rounded-lg border border-warning/25 bg-warning/10 p-2 text-warning">
                <Shield className="h-4 w-4" />
              </div>
            </div>
          </article>
          <article className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-destructive/10 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-destructive/40 hover:shadow-md">
            <div className="absolute right-0 top-0 h-16 w-16 -translate-y-4 translate-x-4 rounded-full bg-destructive/20 blur-xl" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Actions critiques</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-destructive">{criticalActions}</p>
              </div>
              <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-2 text-destructive">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>Surveillance active</span>
            </div>
          </article>
        </section>

        <div className="rounded-xl border border-border/60 bg-card p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Action, email, ressource…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={resource} onValueChange={setResource}>
            <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les ressources</SelectItem>
              {resources.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setOpenExport(true)} className="md:w-auto">
            <Download className="h-4 w-4" /> Téléchargement
          </Button>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAllFiltered}>
              <CheckSquare className="h-4 w-4" /> Tout sélectionner
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              <Square className="h-4 w-4" /> Désélectionner
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">{selectedInFiltered.length} sélectionné(s)</span>
            <Button variant="destructive" size="sm" onClick={requestDeleteSelected} disabled={submitting || selectedInFiltered.length === 0}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Supprimer
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Aucune entrée</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs uppercase text-muted-foreground tracking-wider">
                    <th className="text-left px-4 py-3 font-medium w-10">
                      <Checkbox checked={allPageSelected} onCheckedChange={(v) => toggleSelectCurrentPage(Boolean(v))} />
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Acteur</th>
                    <th className="text-left px-4 py-3 font-medium">Action</th>
                    <th className="text-left px-4 py-3 font-medium">Ressource</th>
                    <th className="text-left px-4 py-3 font-medium">Détails</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((l) => {
                    const Icon = ACTION_ICONS[l.action] ?? ScrollText;
                    const tone = ACTION_TONES[l.action] ?? 'text-muted-foreground';
                    return (
                      <tr key={l.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <Checkbox checked={selectedIds.includes(l.id)} onCheckedChange={(v) => toggleSelect(l.id, Boolean(v))} />
                        </td>
                        <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                          {new Date(l.created_at).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-xs">{l.user_email ?? <span className="text-muted-foreground">système</span>}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tone}`}>
                            <Icon className="h-3.5 w-3.5" /> {l.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px]">{l.resource}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono max-w-md truncate">
                          {l.details && Object.keys(l.details).length > 0 ? JSON.stringify(l.details) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setOpenView(l)} title="Voir">
                              <Eye className="h-4 w-4 text-primary" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => requestDeleteOne(l.id)} title="Supprimer" disabled={submitting}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border/60 bg-card p-3">
            <p className="text-xs text-muted-foreground tabular-nums">
              Affichage {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === page ? 'default' : 'outline'}
                  onClick={() => setPage(p)}
                  className="min-w-9 tabular-nums"
                >
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!openView} onOpenChange={(o) => !o && setOpenView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Détail du log
            </DialogTitle>
            <DialogDescription>ID: {openView?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/60 bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="mt-1 font-medium tabular-nums">{openView?.created_at ? new Date(openView.created_at).toLocaleString('fr-FR') : '—'}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Acteur</p>
                <p className="mt-1 font-medium break-all">{openView?.user_email ?? 'système'}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Action</p>
                <p className="mt-1 font-medium">{openView?.action ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Ressource</p>
                <p className="mt-1 font-medium">{openView?.resource ?? '—'}</p>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <p className="text-xs text-muted-foreground mb-1">Détails JSON</p>
              <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap break-all">
                {openView?.details && Object.keys(openView.details).length > 0
                  ? JSON.stringify(openView.details, null, 2)
                  : '—'}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenView(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent className="border-border/60 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.mode === 'bulk'
                ? `Vous allez supprimer ${confirmDelete.ids.length} logs. Cette action est irreversible.`
                : 'Vous allez supprimer ce log. Cette action est irreversible.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAction}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={openExport} onOpenChange={setOpenExport}>
        <DialogContent className="max-w-lg border-border/60 bg-gradient-to-b from-background to-card p-0 overflow-hidden">
          <DialogHeader className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5">
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="rounded-lg bg-primary/15 p-2 text-primary">
                <Download className="h-4 w-4" />
              </div>
              Centre de téléchargement
            </DialogTitle>
            <DialogDescription>
              Choisissez le périmètre puis le format d’export.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-5">
            <div className="space-y-3 rounded-xl border border-border/60 bg-secondary/10 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Périmètre du téléchargement</p>
                <Badge variant="outline" className="tabular-nums">{getLogsForExport().length} lignes</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button type="button" onClick={() => setExportScope('all')} className={`rounded-lg border px-3 py-2 font-medium transition-all ${exportScope === 'all' ? 'border-primary/50 bg-primary text-primary-foreground shadow-sm' : 'border-border/60 bg-background hover:bg-secondary/40'}`}>Tous les logs</button>
                <button type="button" onClick={() => setExportScope('selected')} className={`rounded-lg border px-3 py-2 font-medium transition-all ${exportScope === 'selected' ? 'border-primary/50 bg-primary text-primary-foreground shadow-sm' : 'border-border/60 bg-background hover:bg-secondary/40'}`}>Logs sélectionnés</button>
                <button type="button" onClick={() => setExportScope('date-range')} className={`rounded-lg border px-3 py-2 font-medium transition-all ${exportScope === 'date-range' ? 'border-primary/50 bg-primary text-primary-foreground shadow-sm' : 'border-border/60 bg-background hover:bg-secondary/40'}`}>Date à date</button>
                <button type="button" onClick={() => setExportScope('week')} className={`rounded-lg border px-3 py-2 font-medium transition-all ${exportScope === 'week' ? 'border-primary/50 bg-primary text-primary-foreground shadow-sm' : 'border-border/60 bg-background hover:bg-secondary/40'}`}>Semaine précise</button>
                <button type="button" onClick={() => setExportScope('month')} className={`rounded-lg border px-3 py-2 font-medium transition-all ${exportScope === 'month' ? 'border-primary/50 bg-primary text-primary-foreground shadow-sm' : 'border-border/60 bg-background hover:bg-secondary/40'}`}>Mois précis</button>
              </div>

              {exportScope === 'date-range' && (
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
                  <Input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
                </div>
              )}
              {exportScope === 'week' && (
                <Input type="week" value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} />
              )}
              {exportScope === 'month' && (
                <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
              )}
            </div>

            {exporting && (
              <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progression du téléchargement</span>
                  <span className="tabular-nums font-semibold">{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}

            <div className="grid gap-3">
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="group flex items-center justify-between rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:border-success/40 hover:bg-success/5 hover:shadow-sm disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success/10 p-2 text-success"><FileSpreadsheet className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-semibold">CSV</p>
                    <p className="text-xs text-muted-foreground">Compatible Excel et Google Sheets</p>
                  </div>
                </div>
                <Badge variant="outline">Rapide</Badge>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="group flex items-center justify-between rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-semibold">PDF</p>
                    <p className="text-xs text-muted-foreground">Rapport professionnel prêt à partager</p>
                  </div>
                </div>
                <Badge variant="outline">Structuré</Badge>
              </button>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 p-4">
            <Button variant="outline" onClick={() => setOpenExport(false)} disabled={exporting}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openExportSuccess} onOpenChange={setOpenExportSuccess}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-lg">Téléchargement terminé</DialogTitle>
            <DialogDescription>Votre fichier a été généré et téléchargé avec succès.</DialogDescription>
          </DialogHeader>
          <div className="mx-auto my-2 h-14 w-14 rounded-full bg-success/15 text-success flex items-center justify-center">
            <CheckSquare className="h-7 w-7" />
          </div>
          <DialogFooter>
            <Button onClick={() => setOpenExportSuccess(false)} className="w-full">Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
