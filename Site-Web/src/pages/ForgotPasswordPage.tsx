import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error('Erreur', { description: error.message });
      return;
    }
    setSent(true);
    toast.success('Email envoyé', { description: 'Vérifiez votre boîte de réception.' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 space-y-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary mb-4">
            <Terminal className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
          <p className="mt-1 text-sm text-muted-foreground">Recevez un lien sécurisé par email</p>
        </div>

        {sent ? (
          <div className="text-center space-y-3 py-4">
            <p className="text-sm">Un lien de réinitialisation a été envoyé à <span className="font-medium text-foreground">{email}</span>.</p>
            <p className="text-xs text-muted-foreground">Le lien expire après 1 heure.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Envoyer le lien
            </Button>
          </form>
        )}

        <Link to="/login" className="text-xs text-primary hover:underline flex items-center gap-1 justify-center">
          <ArrowLeft className="h-3 w-3" /> Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
