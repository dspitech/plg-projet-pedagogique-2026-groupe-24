import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Lock, Loader2, Check, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { validatePasswordStrength } from '@/lib/passwordPolicy';
import { toast } from '@/lib/toast';

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = validatePasswordStrength(password);
  const matches = password.length > 0 && password === confirm;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!strength.valid || !matches || !user) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id);
      await supabase.rpc('log_audit_event', {
        _action: 'first_password_set',
        _resource: 'auth',
        _resource_id: user.id,
        _details: {},
      });
      await refresh();
    }
    setLoading(false);
    if (error) {
      toast.error('Erreur', { description: error.message });
      return;
    }
    toast.success('Mot de passe défini avec succès');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 space-y-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary mb-4">
            <Terminal className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Définissez votre mot de passe</h1>
          <p className="mt-1 text-sm text-muted-foreground">Première connexion — étape obligatoire</p>
        </div>

        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 flex gap-2">
          <ShieldAlert className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning-foreground/90">
            Pour des raisons de sécurité, vous devez choisir un mot de passe personnel avant d'accéder à la plateforme.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pwd">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="pwd" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
            </div>
            <ul className="text-[11px] space-y-0.5 mt-1.5">
              {[
                { ok: password.length >= 16, txt: 'Minimum 16 caractères' },
                { ok: /[A-Z]/.test(password), txt: 'Une majuscule' },
                { ok: /[a-z]/.test(password), txt: 'Une minuscule' },
                { ok: /[0-9]/.test(password), txt: 'Un chiffre' },
                { ok: /[^A-Za-z0-9]/.test(password), txt: 'Un caractère spécial' },
              ].map((c) => (
                <li key={c.txt} className={`flex items-center gap-1.5 ${c.ok ? 'text-success' : 'text-muted-foreground'}`}>
                  {c.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {c.txt}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <Label htmlFor="conf">Confirmer</Label>
            <Input id="conf" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {confirm && !matches && <p className="text-xs text-destructive">Ne correspond pas</p>}
          </div>
          <Button type="submit" disabled={loading || !strength.valid || !matches} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Activer mon compte
          </Button>
        </form>
      </div>
    </div>
  );
}
