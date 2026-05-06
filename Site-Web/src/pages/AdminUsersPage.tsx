import { useEffect, useState, FormEvent } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  UserCheck,
  UserX,
  Crown,
  Activity,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Ban,
  RotateCw,
  Trash2,
  Mail,
  KeyRound,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, AppRole, Profile } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AdminRow extends Profile {
  roles: AppRole[];
}

const ROLE_LABELS: Record<AppRole, string> = {
  global_admin: 'Admin Global',
  admin: 'Admin',
  editor: 'Éditeur',
  viewer: 'Lecteur',
};

const ROLE_COLORS: Record<AppRole, string> = {
  global_admin: 'bg-destructive/15 text-destructive border-destructive/30',
  admin: 'bg-primary/15 text-primary border-primary/30',
  editor: 'bg-warning/15 text-warning border-warning/30',
  viewer: 'bg-muted text-muted-foreground border-border',
};

const ALL_ROLES: AppRole[] = ['global_admin', 'admin', 'editor', 'viewer'];
const PAGE_SIZE = 5;

const extractFunctionErrorMessage = async (error: unknown): Promise<string | null> => {
  if (!error || typeof error !== 'object') return null;

  const err = error as { message?: string; context?: Response };
  const context = err.context;
  if (context && typeof context.json === 'function') {
    try {
      const payload = await context.clone().json() as { error?: string };
      if (payload?.error) return payload.error;
    } catch {
      // Fallback to generic message below when response isn't JSON.
    }
  }

  return err.message ?? null;
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openInvite, setOpenInvite] = useState(false);
  const [openEdit, setOpenEdit] = useState<AdminRow | null>(null);
  const [openView, setOpenView] = useState<AdminRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  // Invite form
  const [iName, setIName] = useState('');
  const [iEmail, setIEmail] = useState('');
  const [iRoles, setIRoles] = useState<AppRole[]>(['viewer']);

  // Edit form
  const [eRoles, setERoles] = useState<AppRole[]>([]);

  const load = async () => {
    setLoading(true);
    const { data: profs } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: rolesData } = await supabase.from('user_roles').select('*');
    const rolesByUser = new Map<string, AppRole[]>();
    (rolesData ?? []).forEach((r: any) => {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    });
    setUsers((profs ?? []).map((p: any) => ({ ...p, roles: rolesByUser.get(p.id) ?? [] })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(
    (u) => u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.is_suspended).length;
  const suspendedUsers = users.filter((u) => u.is_suspended).length;
  const globalAdmins = users.filter((u) => u.roles.includes('global_admin')).length;
  const recentLogins = users.filter((u) => {
    if (!u.last_login) return false;
    return Date.now() - new Date(u.last_login).getTime() <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const viewInitials = openView
    ? (openView.name?.slice(0, 2) || openView.email?.slice(0, 2) || 'U').toUpperCase()
    : 'U';

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const invite = async (e: FormEvent) => {
    e.preventDefault();
    if (iRoles.length === 0) {
      toast.error('Sélectionnez au moins un rôle');
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke('admin-invite-user', {
      body: { name: iName, email: iEmail, roles: iRoles },
    });
    setSubmitting(false);
    if (error || data?.error) {
      const description = data?.error ?? await extractFunctionErrorMessage(error);
      toast.error("Échec de l'invitation", {
        description: description ?? "Erreur inconnue lors de l'invitation",
      });
      return;
    }
    toast.success('Invitation envoyée', { description: `Un email a été envoyé à ${iEmail}` });
    setOpenInvite(false);
    setIName(''); setIEmail(''); setIRoles(['viewer']);
    load();
  };

  const saveEdit = async () => {
    if (!openEdit) return;
    setSubmitting(true);
    // Replace all roles
    await supabase.from('user_roles').delete().eq('user_id', openEdit.id);
    if (eRoles.length > 0) {
      await supabase.from('user_roles').insert(eRoles.map((r) => ({ user_id: openEdit.id, role: r })));
    }
    await supabase.rpc('log_audit_event', {
      _action: 'update_roles',
      _resource: 'users',
      _resource_id: openEdit.id,
      _details: { roles: eRoles },
    });
    setSubmitting(false);
    toast.success('Rôles mis à jour');
    setOpenEdit(null);
    load();
  };

  const toggleSuspend = async (u: AdminRow) => {
    if (u.id === currentUser?.id) {
      toast.error('Vous ne pouvez pas vous suspendre vous-même');
      return;
    }
    const next = !u.is_suspended;
    await supabase.from('profiles').update({ is_suspended: next }).eq('id', u.id);
    await supabase.rpc('log_audit_event', {
      _action: next ? 'suspend' : 'reactivate',
      _resource: 'users',
      _resource_id: u.id,
      _details: { email: u.email },
    });
    toast.success(next ? 'Utilisateur suspendu' : 'Utilisateur réactivé');
    load();
  };

  const forceReset = async (u: AdminRow) => {
    const { error } = await supabase.auth.resetPasswordForEmail(u.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { toast.error(error.message); return; }
    await supabase.from('profiles').update({ must_change_password: true }).eq('id', u.id);
    await supabase.rpc('log_audit_event', {
      _action: 'force_password_reset',
      _resource: 'users',
      _resource_id: u.id,
      _details: { email: u.email },
    });
    toast.success('Email de réinitialisation envoyé');
  };

  const removeUser = async (u: AdminRow) => {
    if (u.id === currentUser?.id) {
      toast.error('Vous ne pouvez pas vous supprimer vous-même');
      return;
    }
    if (!confirm(`Supprimer définitivement ${u.email} ?`)) return;
    const { data, error } = await supabase.functions.invoke('admin-delete-user', {
      body: { user_id: u.id },
    });
    if (error || data?.error) { toast.error(error?.message ?? data?.error); return; }
    toast.success('Utilisateur supprimé');
    load();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <header className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <UsersIcon className="h-6 w-6 text-primary" />
                Gestion des administrateurs
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Invitez, modifiez et gérez les accès de votre équipe.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setOpenInvite(true)}><UserPlus className="h-4 w-4" /> Inviter</Button>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total utilisateurs</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{totalUsers}</p>
              </div>
              <div className="rounded-lg border border-primary/25 bg-primary/10 p-2 text-primary">
                <UsersIcon className="h-4 w-4" />
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-success/10 p-4 shadow-sm transition-all hover:border-success/40 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Actifs</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-success">{activeUsers}</p>
              </div>
              <div className="rounded-lg border border-success/25 bg-success/10 p-2 text-success">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-destructive/10 p-4 shadow-sm transition-all hover:border-destructive/40 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Suspendus</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-destructive">{suspendedUsers}</p>
              </div>
              <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-2 text-destructive">
                <UserX className="h-4 w-4" />
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-warning/10 p-4 shadow-sm transition-all hover:border-warning/40 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Admins globaux</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-warning">{globalAdmins}</p>
              </div>
              <div className="rounded-lg border border-warning/25 bg-warning/10 p-2 text-warning">
                <Crown className="h-4 w-4" />
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Connexions (7j)</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{recentLogins}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/70 p-2 text-foreground">
                <Activity className="h-4 w-4" />
              </div>
            </div>
          </article>
        </section>

        <div className="rounded-xl border border-border/60 bg-card p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Rechercher par nom ou email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Aucun utilisateur</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs uppercase text-muted-foreground tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Utilisateur</th>
                    <th className="text-left px-4 py-3 font-medium">Rôles</th>
                    <th className="text-left px-4 py-3 font-medium">Statut</th>
                    <th className="text-left px-4 py-3 font-medium">Dernière connexion</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                            {u.name.slice(0, 2).toUpperCase() || u.email.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{u.name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.length === 0 && <span className="text-xs text-muted-foreground">Aucun</span>}
                          {u.roles.map((r) => (
                            <Badge key={r} variant="outline" className={`text-[10px] ${ROLE_COLORS[r]}`}>
                              {ROLE_LABELS[r]}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.is_suspended ? (
                          <span className="inline-flex items-center gap-1 text-xs text-destructive"><XCircle className="h-3.5 w-3.5" /> Suspendu</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Actif</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                        {u.last_login ? new Date(u.last_login).toLocaleString('fr-FR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Button size="sm" variant="ghost" title="Voir les informations" onClick={() => setOpenView(u)}>
                            <Eye className="h-4 w-4 text-primary" />
                          </Button>
                          <Button size="sm" variant="ghost" title="Modifier les rôles" onClick={() => { setOpenEdit(u); setERoles(u.roles); }}>
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" title={u.is_suspended ? 'Réactiver' : 'Suspendre'} onClick={() => toggleSuspend(u)}>
                            {u.is_suspended ? <RotateCw className="h-4 w-4 text-success" /> : <Ban className="h-4 w-4 text-warning" />}
                          </Button>
                          <Button size="sm" variant="ghost" title="Forcer reset mot de passe" onClick={() => forceReset(u)}>
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" title="Supprimer" onClick={() => removeUser(u)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* Invite dialog */}
      <Dialog open={openInvite} onOpenChange={setOpenInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Inviter un administrateur</DialogTitle>
            <DialogDescription>
              Un email d'invitation contenant un lien sécurisé sera envoyé. L'utilisateur devra définir son mot de passe.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={invite} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input required value={iName} onChange={(e) => setIName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" required className="pl-9" value={iEmail} onChange={(e) => setIEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rôles</Label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_ROLES.map((r) => (
                  <label key={r} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/60 cursor-pointer hover:bg-secondary/30">
                    <Checkbox
                      checked={iRoles.includes(r)}
                      onCheckedChange={(c) => {
                        if (c) setIRoles([...iRoles, r]);
                        else setIRoles(iRoles.filter((x) => x !== r));
                      }}
                    />
                    <span className="text-sm">{ROLE_LABELS[r]}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenInvite(false)}>Annuler</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Envoyer l'invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit roles dialog */}
      <Dialog open={!!openEdit} onOpenChange={(o) => !o && setOpenEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les rôles</DialogTitle>
            <DialogDescription>{openEdit?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {ALL_ROLES.map((r) => (
              <label key={r} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/60 cursor-pointer hover:bg-secondary/30">
                <Checkbox
                  checked={eRoles.includes(r)}
                  onCheckedChange={(c) => {
                    if (c) setERoles([...eRoles, r]);
                    else setERoles(eRoles.filter((x) => x !== r));
                  }}
                />
                <span className="text-sm">{ROLE_LABELS[r]}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(null)}>Annuler</Button>
            <Button onClick={saveEdit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View user dialog */}
      <Dialog open={!!openView} onOpenChange={(o) => !o && setOpenView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-sm font-bold">
                    {viewInitials}
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="text-lg truncate">{openView?.name || 'Utilisateur'}</DialogTitle>
                    <DialogDescription className="truncate">{openView?.email}</DialogDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={openView?.is_suspended
                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                    : 'bg-success/10 text-success border-success/30'}
                >
                  {openView?.is_suspended ? 'Suspendu' : 'Actif'}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Nom</p>
                <p className="mt-1 font-medium">{openView?.name || '—'}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="mt-1 font-medium break-all">{openView?.email || '—'}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Mot de passe à changer</p>
                <p className="mt-1 font-medium inline-flex items-center gap-1.5">
                  {openView?.must_change_password ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-warning" />
                      Oui
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-success" />
                      Non
                    </>
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3">
                <p className="text-xs text-muted-foreground">Créé le</p>
                <p className="mt-1 font-medium tabular-nums">{openView?.created_at ? new Date(openView.created_at).toLocaleString('fr-FR') : '—'}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Dernière connexion</p>
                <p className="mt-1 font-medium tabular-nums">{openView?.last_login ? new Date(openView.last_login).toLocaleString('fr-FR') : '—'}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-3">
              <p className="text-xs text-muted-foreground mb-2">Rôles attribués</p>
              <div className="flex flex-wrap gap-2">
                {(openView?.roles ?? []).length === 0 && <span className="text-xs text-muted-foreground">Aucun rôle</span>}
                {(openView?.roles ?? []).map((r) => (
                  <Badge key={r} variant="outline" className={`${ROLE_COLORS[r]} px-2.5 py-1`}>
                    {ROLE_LABELS[r]}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenView(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
