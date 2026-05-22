import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Lock, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { validatePasswordStrength } from '@/lib/passwordPolicy';
import { toast } from '@/lib/toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    // Supabase auth handles the token in the URL hash automatically
    supabase.auth.getSession().then(({ data }) => setValid(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setValid(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const strength = validatePasswordStrength(password);
  const matches = password.length > 0 && password === confirm;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!strength.valid || !matches) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id);
        await supabase.rpc('log_audit_event', {
          _action: 'password_reset',
          _resource: 'auth',
          _resource_id: user.id,
          _details: {},
        });
      }
    }
    setLoading(false);
    if (error) {
      toast.error('Erreur', { description: error.message });
      return;
    }
    toast.success('Mot de passe mis à jour');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 space-y-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary mb-4">
            <Terminal className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choisissez un mot de passe robuste</p>
        </div>

        {!valid ? (
          <p className="text-sm text-center text-muted-foreground">Lien invalide ou expiré.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pwd">Nouveau mot de passe</Label>
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
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Mettre à jour
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
