import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useUserData';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@cloudscripts.io');
  const [password, setPassword] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    toast.success('Connexion réussie');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary mb-4">
            <Terminal className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Cloud Scripts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Connectez-vous à votre dashboard</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="search-input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Mot de passe</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="search-input pl-10"
              />
            </div>
          </div>
          <Button type="submit" className="w-full gap-2">
            <LogIn className="h-4 w-4" />
            Se connecter
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Démo — toute combinaison email/mot de passe est acceptée
        </p>
      </div>
    </div>
  );
}
