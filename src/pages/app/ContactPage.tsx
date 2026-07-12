import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  ArchiveX,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Inbox,
  Mail,
  MessageSquare,
  MoreVertical,
  RefreshCcw,
  Reply,
  Search,
  Star,
  Trash2,
  User,
  type LucideIcon,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

type ContactStatus =
  | 'unread'
  | 'read'
  | 'archived'
  | 'replied'
  | 'pending'
  | 'important'
  | 'later';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  phone: string | null;
  company: string | null;
  status: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_META: Record<ContactStatus, { label: string; badge: 'secondary' | 'outline' | 'destructive' | 'default'; className?: string; icon: LucideIcon }> = {
  unread: { label: 'Non lu', badge: 'default', className: 'bg-primary/15 text-primary border-primary/30', icon: Inbox },
  read: { label: 'Lu', badge: 'secondary', icon: Eye },
  archived: { label: 'Archivé', badge: 'outline', icon: Archive },
  replied: { label: 'Répondu', badge: 'secondary', className: 'bg-success/15 text-success border-success/30', icon: Reply },
  pending: { label: 'En attente', badge: 'secondary', className: 'bg-warning/15 text-warning border-warning/30', icon: Clock },
  important: { label: 'Important', badge: 'secondary', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30', icon: Star },
  later: { label: 'À traiter plus tard', badge: 'outline', icon: Clock },
};

function normalizeStatus(raw: string): ContactStatus {
  const v = (raw || '').toLowerCase().trim();
  if (v === 'unread' || v === 'read' || v === 'archived' || v === 'replied' || v === 'pending' || v === 'important' || v === 'later') return v;
  return 'unread';
}

function statusPriority(s: ContactStatus): 'high' | 'normal' {
  return s === 'important' ? 'high' : 'normal';
}

function preview(text: string, max = 90) {
  const t = (text ?? '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function ContactPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<ContactStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<'created_at' | 'name' | 'email' | 'subject' | 'status' | 'priority'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [page, setPage] = useState(1);
  const perPage = 12;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [viewOpen, setViewOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [active, setActive] = useState<ContactMessage | null>(null);

  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) setLoading(true);
    setRefreshing(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('id,name,email,subject,message,category,phone,company,status,user_agent,ip_address,created_at,updated_at')
      .order('created_at', { ascending: false });
    setRefreshing(false);
    if (!silent) setLoading(false);
    if (error) {
      toast.error(`Erreur chargement messages: ${error.message}`);
      return;
    }
    setItems((data ?? []) as ContactMessage[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const enriched = useMemo(() => {
    return items.map((m) => {
      const st = normalizeStatus(m.status);
      return { ...m, _status: st as ContactStatus, _priority: statusPriority(st) };
    });
  }, [items]);

  const stats = useMemo(() => {
    const total = enriched.length;
    const count = (s: ContactStatus) => enriched.filter((m) => m._status === s).length;
    return {
      total,
      unread: count('unread'),
      archived: count('archived'),
      replied: count('replied'),
      pending: count('pending'),
      important: count('important'),
      later: count('later'),
    };
  }, [enriched]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return enriched.filter((m) => {
      const matchQ =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.subject.toLowerCase().includes(term) ||
        m.message.toLowerCase().includes(term);
      const matchF = filter === 'all' || m._status === filter;
      return matchQ && matchF;
    });
  }, [enriched, q, filter]);

  const getSortValue = useCallback((m: (typeof enriched)[number], key: typeof sortKey) => {
    switch (key) {
      case 'created_at':
        return m.created_at;
      case 'name':
        return m.name;
      case 'email':
        return m.email;
      case 'subject':
        return m.subject;
      case 'status':
        return m._status;
      case 'priority':
        return m._priority;
      default:
        return '';
    }
  }, []);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      if (sortKey === 'created_at') return dir * (new Date(String(av)).getTime() - new Date(String(bv)).getTime());
      return dir * String(av ?? '').localeCompare(String(bv ?? ''), 'fr', { sensitivity: 'base' });
    });
    return copy;
  }, [filtered, getSortValue, sortKey, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [q, filter, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, currentPage]);

  const allOnPageSelected = useMemo(() => paged.length > 0 && paged.every((m) => selectedIds.has(m.id)), [paged, selectedIds]);

  const setStatus = async (id: string, status: ContactStatus) => {
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, status, updated_at: new Date().toISOString() } : m)));
  };

  const bulkSetStatus = async (status: ContactStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const { error } = await supabase.from('contact_messages').update({ status }).in('id', ids);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Mise à jour effectuée', { description: `${ids.length} message(s) mis à jour.` });
    setItems((prev) => prev.map((m) => (selectedIds.has(m.id) ? { ...m, status, updated_at: new Date().toISOString() } : m)));
    setSelectedIds(new Set());
  };

  const openView = async (m: ContactMessage) => {
    setActive(m);
    setViewOpen(true);
    const st = normalizeStatus(m.status);
    if (st === 'unread') await setStatus(m.id, 'read');
  };

  const openReply = (m: ContactMessage) => {
    setActive(m);
    setReplySubject(`Re: ${m.subject}`);
    setReplyBody(
      `Bonjour ${m.name},\n\n` +
      `Merci pour votre message. \n\n` +
      `---\n` +
      `Rappel de votre demande:\n` +
      `${m.message}\n`,
    );
    setReplyOpen(true);
  };

  const sendReply = async () => {
    if (!active) return;
    setSendingReply(true);
    try {
      const mailto = `mailto:${encodeURIComponent(active.email)}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
      window.location.href = mailto;
      await setStatus(active.id, 'replied');
      toast.success('Réponse préparée', { description: 'Votre application mail va s’ouvrir.' });
      setReplyOpen(false);
    } finally {
      setSendingReply(false);
    }
  };

  const confirmDelete = (m: ContactMessage) => {
    setActive(m);
    setDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!active) return;
    setDeleting(true);
    const { error } = await supabase.from('contact_messages').delete().eq('id', active.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Message supprimé');
    setItems((prev) => prev.filter((m) => m.id !== active.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(active.id);
      return next;
    });
    setDeleteOpen(false);
    setActive(null);
  };

  const headerSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'created_at' ? 'desc' : 'asc');
    }
  };

  const StatCard = ({ title, value, icon: Icon, hint, tone }: { title: string; value: number; icon: LucideIcon; hint: string; tone?: string }) => (
    <Card className="relative overflow-hidden p-5 border-border/60 bg-card/40 backdrop-blur hover:border-primary/40 transition-all hover:-translate-y-0.5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.10),transparent_55%)] opacity-0 hover:opacity-100 transition-opacity" />
      <div className="relative flex items-start justify-between gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${tone ?? 'bg-primary/10 text-primary border-primary/20'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold tabular-nums">{value.toLocaleString('fr-FR')}</div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{title}</div>
        </div>
      </div>
      <div className="relative mt-3 text-xs text-muted-foreground">{hint}</div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Messages de contact</h1>
            <p className="mt-1 text-muted-foreground">
              Interface de gestion des messages utilisateurs (tri, filtres, actions, modals).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => load({ silent: true })} disabled={refreshing} className="gap-2">
              <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            {selectedIds.size > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2">
                    <Filter className="h-4 w-4" />
                    Actions ({selectedIds.size})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Actions groupées</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => bulkSetStatus('read')}>Marquer comme lu</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkSetStatus('unread')}>Marquer comme non lu</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkSetStatus('important')}>Marquer important</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkSetStatus('pending')}>Mettre en attente</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkSetStatus('later')}>Répondre plus tard</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => bulkSetStatus('archived')}>Archiver</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard title="Total" value={stats.total} icon={MessageSquare} hint="Tous les messages" />
          <StatCard title="Non lus" value={stats.unread} icon={Inbox} hint="À traiter" tone="bg-primary/10 text-primary border-primary/25" />
          <StatCard title="Archivés" value={stats.archived} icon={Archive} hint="Historique" tone="bg-muted/20 text-muted-foreground border-border/60" />
          <StatCard title="Répondus" value={stats.replied} icon={CheckCircle2} hint="Clôturés" tone="bg-success/15 text-success border-success/30" />
          <StatCard title="En attente" value={stats.pending} icon={Clock} hint="En cours" tone="bg-warning/15 text-warning border-warning/30" />
          <StatCard title="Importants" value={stats.important} icon={Star} hint="Prioritaires" tone="bg-orange-500/15 text-orange-400 border-orange-500/30" />
        </div>

        {/* Toolbar */}
        <Card className="p-4 border-border/60 bg-card/40 backdrop-blur">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (nom, email, sujet, message)..." className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Tous</Button>
              <Button size="sm" variant={filter === 'unread' ? 'default' : 'outline'} onClick={() => setFilter('unread')}>Non lus</Button>
              <Button size="sm" variant={filter === 'read' ? 'default' : 'outline'} onClick={() => setFilter('read')}>Lus</Button>
              <Button size="sm" variant={filter === 'important' ? 'default' : 'outline'} onClick={() => setFilter('important')}>Importants</Button>
              <Button size="sm" variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>En attente</Button>
              <Button size="sm" variant={filter === 'replied' ? 'default' : 'outline'} onClick={() => setFilter('replied')}>Répondus</Button>
              <Button size="sm" variant={filter === 'later' ? 'default' : 'outline'} onClick={() => setFilter('later')}>À suivre</Button>
              <Button size="sm" variant={filter === 'archived' ? 'default' : 'outline'} onClick={() => setFilter('archived')}>Archivés</Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden border-border/60 bg-card/40 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Boîte de réception</span>
              <span>—</span>
              <span>{sorted.length} résultat(s)</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => headerSort('created_at')} className="gap-1">
                Date <ArrowUpDown className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => headerSort('status')} className="gap-1">
                Statut <ArrowUpDown className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => headerSort('priority')} className="gap-1">
                Priorité <ArrowUpDown className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[44px]">
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={(v) => {
                      const next = new Set(selectedIds);
                      if (v) paged.forEach((m) => next.add(m.id));
                      else paged.forEach((m) => next.delete(m.id));
                      setSelectedIds(next);
                    }}
                    aria-label="Sélectionner la page"
                  />
                </TableHead>
                <TableHead className="min-w-[160px]">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => headerSort('name')}>
                    Nom <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="min-w-[200px] hidden md:table-cell">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => headerSort('email')}>
                    Email <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => headerSort('subject')}>
                    Sujet <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">Aperçu</TableHead>
                <TableHead className="min-w-[170px] hidden lg:table-cell">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => headerSort('created_at')}>
                    Date <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="min-w-[140px]">Statut</TableHead>
                <TableHead className="min-w-[110px] hidden md:table-cell">Priorité</TableHead>
                <TableHead className="w-[52px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-72" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-16">
                    <div className="text-center space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted/30 border border-border/60">
                        <ArchiveX className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium">Aucun message</p>
                      <p className="text-sm text-muted-foreground">Essayez d’ajuster la recherche ou les filtres.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((m) => {
                  const st = normalizeStatus(m.status);
                  const meta = STATUS_META[st];
                  const PriorityBadge = st === 'important'
                    ? <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">Haute</Badge>
                    : <Badge variant="outline" className="text-muted-foreground">Normale</Badge>;

                  return (
                    <TableRow key={m.id} data-state={selectedIds.has(m.id) ? 'selected' : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(m.id)}
                          onCheckedChange={(v) => {
                            const next = new Set(selectedIds);
                            if (v) next.add(m.id);
                            else next.delete(m.id);
                            setSelectedIds(next);
                          }}
                          aria-label="Sélectionner"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <button onClick={() => openView(m)} className="text-left hover:text-primary transition-colors">
                          {m.name}
                        </button>
                        <div className="text-xs text-muted-foreground md:hidden">{m.email}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{m.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {st === 'important' && <Star className="h-4 w-4 text-orange-400" />}
                          <span className="font-medium line-clamp-1">{m.subject}</span>
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1 lg:hidden">{preview(m.message, 70)}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {preview(m.message)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{formatDate(m.created_at)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={meta.badge}
                          className={meta.className}
                          role="button"
                          tabIndex={0}
                          onClick={() => setStatus(m.id, st === 'archived' ? 'read' : 'archived')}
                        >
                          <meta.icon className="h-3.5 w-3.5 mr-1" />
                          {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{PriorityBadge}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Actions">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openView(m)}>
                              <Eye className="h-4 w-4 mr-2" /> Consulter
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openReply(m)}>
                              <Reply className="h-4 w-4 mr-2" /> Répondre
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setStatus(m.id, st === 'important' ? 'read' : 'important')}>
                              <Star className="h-4 w-4 mr-2" /> {st === 'important' ? 'Retirer important' : 'Marquer important'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatus(m.id, st === 'unread' ? 'read' : 'unread')}>
                              <Inbox className="h-4 w-4 mr-2" /> {st === 'unread' ? 'Marquer lu' : 'Marquer non lu'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatus(m.id, 'later')}>
                              <Clock className="h-4 w-4 mr-2" /> Répondre plus tard
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatus(m.id, 'pending')}>
                              <Clock className="h-4 w-4 mr-2" /> Mettre en attente
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatus(m.id, 'archived')}>
                              <Archive className="h-4 w-4 mr-2" /> Archiver
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => confirmDelete(m)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {pageCount > 1 && (
            <div className="px-4 py-4 border-t border-border/60">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} />
                  </PaginationItem>
                  {Array.from({ length: pageCount }).slice(0, 7).map((_, idx) => {
                    const p = idx + 1;
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink href="#" isActive={p === currentPage} onClick={(e) => { e.preventDefault(); setPage(p); }}>
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(pageCount, p + 1)); }} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Page {currentPage} / {pageCount}
              </p>
            </div>
          )}
        </Card>

        {/* View Modal */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {active?.subject ?? 'Message'}
              </DialogTitle>
              <DialogDescription>
                {active ? `${active.name} • ${active.email} • ${formatDate(active.created_at)}` : ''}
              </DialogDescription>
            </DialogHeader>
            {active && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card className="p-3 border-border/60 bg-background/40">
                    <p className="text-xs text-muted-foreground mb-1">Contact</p>
                    <p className="text-sm font-medium">{active.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" /> {active.email}
                    </p>
                  </Card>
                  <Card className="p-3 border-border/60 bg-background/40">
                    <p className="text-xs text-muted-foreground mb-1">Détails</p>
                    <p className="text-sm text-muted-foreground">Catégorie: <span className="text-foreground font-medium">{active.category}</span></p>
                    {active.phone && <p className="text-sm text-muted-foreground">Téléphone: <span className="text-foreground font-medium">{active.phone}</span></p>}
                    {active.company && <p className="text-sm text-muted-foreground">Société: <span className="text-foreground font-medium">{active.company}</span></p>}
                  </Card>
                </div>

                <Card className="p-4 border-border/60 bg-background/40">
                  <p className="text-xs text-muted-foreground mb-2">Message</p>
                  <p className="text-sm whitespace-pre-line leading-relaxed">{active.message}</p>
                </Card>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setStatus(active.id, 'archived')} className="gap-2">
                      <Archive className="h-4 w-4" /> Archiver
                    </Button>
                    <Button variant="outline" onClick={() => setStatus(active.id, normalizeStatus(active.status) === 'important' ? 'read' : 'important')} className="gap-2">
                      <Star className="h-4 w-4" /> Important
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => { setViewOpen(false); if (active) openReply(active); }} className="gap-2">
                      <Reply className="h-4 w-4" /> Répondre
                    </Button>
                    <Button variant="destructive" onClick={() => { setViewOpen(false); if (active) confirmDelete(active); }} className="gap-2">
                      <Trash2 className="h-4 w-4" /> Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reply Modal */}
        <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Reply className="h-5 w-5 text-primary" />
                Répondre
              </DialogTitle>
              <DialogDescription>
                {active ? `À: ${active.email}` : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Sujet</p>
                <Input value={replySubject} onChange={(e) => setReplySubject(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Message</p>
                <Textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={10} className="font-mono text-sm" />
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(replyBody);
                  toast.success('Réponse copiée');
                }}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Copier la réponse
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setReplyOpen(false)}>Annuler</Button>
                <Button onClick={sendReply} disabled={sendingReply || !active} className="gap-2">
                  <Reply className="h-4 w-4" />
                  {sendingReply ? 'Préparation...' : 'Envoyer'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirm */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le message ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le message sera supprimé définitivement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={doDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deleting ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
