import { Share2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ScriptCard } from '@/components/dashboard/ScriptCard';
import { useUserData } from '@/hooks/useUserData';
import { getScriptsByIds } from '@/data/scripts';

export default function SharesPage() {
  const { shares } = useUserData();
  const list = getScriptsByIds(shares);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Share2 className="h-6 w-6 text-primary" />
            Mes Partages
          </h1>
          <p className="mt-1 text-muted-foreground">Retrouvez vos scripts partagés</p>
        </div>
        {list.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Aucun script partagé</h3>
            <p className="text-muted-foreground mt-1">
              Utilisez le bouton "Partager" sur un script pour le retrouver ici
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {list.map((s) => (
              <ScriptCard key={s.id} script={s} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
