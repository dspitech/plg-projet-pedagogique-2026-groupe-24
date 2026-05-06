import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, Mail, Lock, User, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { validatePasswordStrength } from '@/lib/passwordPolicy';
import { toast } from 'sonner';

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = validatePasswordStrength(password);
  const matches = password.length > 0 && password === confirm;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!strength.valid) {
      toast.error('Mot de passe non conforme à la politique de sécurité');
      return;
    }
    if (!matches) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { name },
      },
    });
    setLoading(false);
    if (error) {
      toast.error('Inscription impossible', { description: error.message });
      return;
    }
    toast.success('Compte créé', { description: 'Vérifiez votre email pour confirmer.' });
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border/60 bg-card p-8 space-y-6 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary mb-4">
              <Terminal className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">S'inscrire</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Créez votre compte pour commencer à gérer vos scripts.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmer</Label>
              <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={confirm.length > 0 && !matches} />
              {confirm && !matches && <p className="text-xs text-destructive">Ne correspond pas</p>}
            </div>
            <Button type="submit" disabled={loading || !strength.valid || !matches} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Créer le compte
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">← Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
