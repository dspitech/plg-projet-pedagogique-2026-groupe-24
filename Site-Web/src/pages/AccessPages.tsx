import { Link } from 'react-router-dom';
import { ShieldOff, Ban, Home } from 'lucide-react';
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
