import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff, Ban, Home, AlertTriangle, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldOff className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">Accès refusé</h1>
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.
          Contactez un Administrateur Global si vous pensez qu'il s'agit d'une erreur.
        </p>
        <Button asChild>
          <Link to="/"><Home className="h-4 w-4" /> Retour à l'accueil</Link>
        </Button>
      </div>
    </div>
  );
}

export function SuspendedPage() {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Ban className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">Compte suspendu</h1>
        <p className="text-sm text-muted-foreground">
          Votre compte a été temporairement suspendu. Veuillez contacter un Administrateur Global pour
          plus d'informations.
        </p>
        <Button onClick={() => signOut()} variant="outline">Se déconnecter</Button>
      </div>
    </div>
  );
}

export function NoSignupPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border/60 bg-card p-8 space-y-5 shadow-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10 text-warning ring-1 ring-warning/30">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Inscription désactivée</h1>
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas les droits nécessaires pour accéder à cette page.
              La création de comptes en libre-service est limitée et accessible uniquement sur autorisation de l’administrateur.
            </p>
            <p className="text-xs text-muted-foreground">
              Veuillez contacter le support ou votre administrateur pour obtenir un accès.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={() => navigate('/login')} className="w-full">
              <ArrowLeft className="h-4 w-4" /> Retour à la connexion
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="mailto:support@cloudscripts.app"><Mail className="h-4 w-4" /> Contacter le support</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
