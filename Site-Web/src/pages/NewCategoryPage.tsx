import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ChevronRight,
  FolderPlus,
  Save,
  X,
  Users,
  Layers,
  Rocket,
  Shield,
  Database,
  Cloud,
  Server,
  Lock,
  Settings,
  Activity,
  Box,
  GitBranch,
  type LucideIcon,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'Users', icon: Users },
  { name: 'Layers', icon: Layers },
  { name: 'Rocket', icon: Rocket },
  { name: 'Shield', icon: Shield },
  { name: 'Database', icon: Database },
  { name: 'Cloud', icon: Cloud },
  { name: 'Server', icon: Server },
  { name: 'Lock', icon: Lock },
  { name: 'Settings', icon: Settings },
  { name: 'Activity', icon: Activity },
  { name: 'Box', icon: Box },
  { name: 'GitBranch', icon: GitBranch },
];

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

const categorySchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit faire au moins 2 caractères').max(60, 'Maximum 60 caractères'),
  description: z.string().trim().max(280, 'Maximum 280 caractères').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide'),
  icon: z.string().min(1, 'Sélectionnez une icône'),
  status: z.enum(['active', 'inactive']),
});

export default function NewCategoryPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('Users');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const SelectedIcon = ICONS.find((i) => i.name === icon)?.icon ?? Users;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = categorySchema.safeParse({ name, description, color, icon, status });
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
    // Persist locally (no backend yet)
    const stored = JSON.parse(localStorage.getItem('custom_categories') || '[]');
    stored.push({ ...result.data, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    localStorage.setItem('custom_categories', JSON.stringify(stored));
    setTimeout(() => {
      toast.success('Catégorie créée avec succès');
      navigate('/categories');
    }, 400);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/categories" className="hover:text-foreground transition-colors">Catégories</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Nouvelle catégorie</span>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60"
            style={{ backgroundColor: `${color}1a`, borderColor: `${color}55` }}
          >
            <FolderPlus className="h-6 w-6" style={{ color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nouvelle catégorie</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Créez une catégorie pour organiser vos scripts par domaine fonctionnel.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="cat-name">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cat-name"
                  placeholder="Ex: Sécurité réseau"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'cat-name-error' : undefined}
                  maxLength={60}
                />
                <div className="flex items-center justify-between text-xs">
                  {errors.name ? (
                    <p id="cat-name-error" className="text-destructive">{errors.name}</p>
                  ) : (
                    <span className="text-muted-foreground">Nom court et explicite</span>
                  )}
                  <span className="text-muted-foreground tabular-nums">{name.length}/60</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat-desc">Description</Label>
                <Textarea
                  id="cat-desc"
                  placeholder="Décrivez le périmètre de cette catégorie..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={280}
                  aria-invalid={!!errors.description}
                />
                <div className="flex items-center justify-between text-xs">
                  {errors.description ? (
                    <p className="text-destructive">{errors.description}</p>
                  ) : (
                    <span className="text-muted-foreground">Optionnel — visible sur la page de la catégorie</span>
                  )}
                  <span className="text-muted-foreground tabular-nums">{description.length}/280</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-success" />
                          Actif
                        </span>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                          Inactif
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cat-color">Couleur</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="cat-color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-14 rounded-md border border-border bg-background cursor-pointer"
                      aria-label="Sélecteur de couleur"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="font-mono text-sm uppercase"
                      maxLength={7}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                          'h-6 w-6 rounded-md border-2 transition-all',
                          color.toLowerCase() === c.toLowerCase()
                            ? 'border-foreground scale-110'
                            : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: c }}
                        aria-label={`Choisir la couleur ${c}`}
                      />
                    ))}
                  </div>
                  {errors.color && <p className="text-xs text-destructive">{errors.color}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Icône <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {ICONS.map(({ name: iName, icon: Ico }) => (
                    <button
                      key={iName}
                      type="button"
                      onClick={() => setIcon(iName)}
                      title={iName}
                      className={cn(
                        'flex h-11 items-center justify-center rounded-lg border transition-all',
                        icon === iName
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      )}
                      aria-pressed={icon === iName}
                      aria-label={`Icône ${iName}`}
                    >
                      <Ico className="h-5 w-5" />
                    </button>
                  ))}
                </div>
                {errors.icon && <p className="text-xs text-destructive">{errors.icon}</p>}
              </div>
            </Card>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/categories')}>
                <X className="h-4 w-4" /> Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="h-4 w-4" /> {submitting ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </div>

          {/* Live preview */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Aperçu en direct
            </Label>
            <Card className="p-5 space-y-4 sticky top-6">
              <div className="flex items-start justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-lg border"
                  style={{ backgroundColor: `${color}1a`, borderColor: `${color}55` }}
                >
                  <SelectedIcon className="h-5 w-5" style={{ color }} />
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide',
                    status === 'active'
                      ? 'bg-success/15 text-success'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', status === 'active' ? 'bg-success' : 'bg-muted-foreground')} />
                  {status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-base">{name || 'Nom de la catégorie'}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                  {description || 'La description apparaîtra ici…'}
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground">
                <span className="font-mono">slug: {name.toLowerCase().replace(/\s+/g, '-') || '—'}</span>
              </div>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
