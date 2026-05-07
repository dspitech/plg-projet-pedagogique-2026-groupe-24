import { useEffect, useRef, useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Globe,
  Camera,
  Loader2,
  Save,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileForm {
  name: string;
  first_name: string;
  email: string;
  profession: string;
  bio: string;
  phone: string;
  avatar_url: string;
  address: string;
  city: string;
  country: string;
  status: string;
}

const EMPTY: ProfileForm = {
  name: '',
  first_name: '',
  email: '',
  profession: '',
  bio: '',
  phone: '',
  avatar_url: '',
  address: '',
  city: '',
  country: '',
  status: 'active',
};

export default function ProfilePage() {
  const { user, roles, refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) toast.error('Erreur de chargement du profil');
      if (data) {
        setForm({
          name: data.name ?? '',
          first_name: (data as any).first_name ?? '',
          email: data.email ?? user.email ?? '',
          profession: (data as any).profession ?? '',
          bio: (data as any).bio ?? '',
          phone: (data as any).phone ?? '',
          avatar_url: (data as any).avatar_url ?? '',
          address: (data as any).address ?? '',
          city: (data as any).city ?? '',
          country: (data as any).country ?? '',
          status: (data as any).status ?? 'active',
        });
        setCreatedAt(data.created_at);
      }
      setLoading(false);
    })();
  }, [user]);

  const set = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const initials = (form.first_name?.[0] ?? form.name?.[0] ?? form.email?.[0] ?? '?')
    .toString()
    .toUpperCase();

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Le nom est requis';
    if (form.name.length > 100) return 'Le nom est trop long';
    if (form.bio.length > 500) return 'Bio trop longue (max 500)';
    if (form.phone && !/^[+\d\s().-]{6,20}$/.test(form.phone)) return 'Téléphone invalide';
    return null;
  };

  const handleSave = async () => {
    if (!user) return;
    const err = validate();
    if (err) return toast.error(err);
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: form.name.trim(),
        first_name: form.first_name.trim() || null,
        profession: form.profession.trim() || null,
        bio: form.bio.trim() || null,
        phone: form.phone.trim() || null,
        avatar_url: form.avatar_url || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        status: form.status,
      } as any)
      .eq('id', user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Profil mis à jour');
    refresh();
  };

  const handleAvatar = async (file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image > 5 Mo');
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, cacheControl: '3600' });
    if (upErr) {
      setUploading(false);
      return toast.error(upErr.message);
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = data.publicUrl;
    set('avatar_url', url);
    await supabase.from('profiles').update({ avatar_url: url } as any).eq('id', user.id);
    setUploading(false);
    toast.success('Photo mise à jour');
    refresh();
  };

  const statusColor: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    away: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    busy: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    offline: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <header className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Mon Profil</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gérez vos informations personnelles et votre identité visible par l'équipe.
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 lg:col-span-1" />
            <Skeleton className="h-80 lg:col-span-2" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left card — Identity */}
            <section className="lg:col-span-1 space-y-6">
              <div className="rounded-xl border border-border/60 bg-card p-6 text-center">
                <div className="relative inline-block group">
                  <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-3xl font-bold text-primary-foreground overflow-hidden ring-4 ring-background shadow-lg">
                    {form.avatar_url ? (
                      <img src={form.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:scale-105 transition-transform disabled:opacity-50"
                    aria-label="Changer la photo"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleAvatar(e.target.files[0])}
                  />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {form.first_name} {form.name}
                </h2>
                <p className="text-sm text-muted-foreground">{form.profession || 'Aucun rôle défini'}</p>
                <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                  <Badge variant="outline" className={statusColor[form.status] ?? statusColor.active}>
                    <CheckCircle2 className="h-3 w-3" /> {form.status}
                  </Badge>
                  {roles.map((r) => (
                    <Badge key={r} variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3" /> {r}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-6 space-y-3 text-sm">
                <h3 className="font-semibold text-foreground mb-2">Coordonnées</h3>
                <Row icon={Mail} label="Email" value={form.email} />
                <Row icon={Phone} label="Téléphone" value={form.phone || '—'} />
                <Row icon={MapPin} label="Ville" value={form.city || '—'} />
                <Row icon={Globe} label="Pays" value={form.country || '—'} />
                {createdAt && (
                  <Row
                    icon={Calendar}
                    label="Membre depuis"
                    value={new Date(createdAt).toLocaleDateString('fr-FR')}
                  />
                )}
              </div>
            </section>

            {/* Right — Edit form */}
            <section className="lg:col-span-2 space-y-6">
              <Card title="Informations personnelles" icon={UserIcon}>
                <Grid>
                  <Field label="Prénom">
                    <Input value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
                  </Field>
                  <Field label="Nom" required>
                    <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
                  </Field>
                  <Field label="Email">
                    <Input type="email" value={form.email} disabled />
                  </Field>
                  <Field label="Téléphone">
                    <Input
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </Field>
                  <Field label="Statut">
                    <Select value={form.status} onValueChange={(v) => set('status', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="away">Absent</SelectItem>
                        <SelectItem value="busy">Occupé</SelectItem>
                        <SelectItem value="offline">Hors ligne</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Profession">
                    <Input
                      value={form.profession}
                      onChange={(e) => set('profession', e.target.value)}
                      placeholder="Cloud Engineer"
                    />
                  </Field>
                </Grid>
              </Card>

              <Card title="Adresse" icon={Building2}>
                <Grid>
                  <Field label="Adresse" full>
                    <Input value={form.address} onChange={(e) => set('address', e.target.value)} />
                  </Field>
                  <Field label="Ville">
                    <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
                  </Field>
                  <Field label="Pays">
                    <Input value={form.country} onChange={(e) => set('country', e.target.value)} />
                  </Field>
                </Grid>
              </Card>

              <Card title="Biographie" icon={Briefcase}>
                <Textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => set('bio', e.target.value)}
                  placeholder="Quelques mots à propos de vous..."
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{form.bio.length}/500</p>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer les modifications
                </Button>
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label,
  children,
  required,
  full,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? 'md:col-span-2 space-y-1.5' : 'space-y-1.5'}>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
