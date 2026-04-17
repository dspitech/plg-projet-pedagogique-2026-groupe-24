import { History, Eye, Download, Share2, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useUserData, HistoryEntry } from '@/hooks/useUserData';
import { getScriptById } from '@/data/scripts';

const actionIcon = {
  view: Eye,
  download: Download,
  share: Share2,
  favorite: Star,
};

const actionLabel: Record<HistoryEntry['action'], string> = {
  view: 'Consulté',
  download: 'Téléchargé',
  share: 'Partagé',
  favorite: 'Favori modifié',
};

const actionColor: Record<HistoryEntry['action'], string> = {
  view: 'text-primary bg-primary/10',
  download: 'text-success bg-success/10',
  share: 'text-info bg-info/10',
  favorite: 'text-warning bg-warning/10',
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryPage() {
  const { history, clearHistory } = useUserData();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              Historique
            </h1>
            <p className="mt-1 text-muted-foreground">Suivi de vos actions recentes</p>
          </div>
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Effacer l'historique
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Aucune activité</h3>
            <p className="text-muted-foreground mt-1">
              Vos interactions avec les scripts apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-xl divide-y divide-border/50">
            {history.map((entry, idx) => {
              const script = getScriptById(entry.scriptId);
              if (!script) return null;
              const Icon = actionIcon[entry.action];
              return (
                <Link
                  key={idx}
                  to={`/script/${script.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${actionColor[entry.action]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{script.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {actionLabel[entry.action]} • {script.provider.toUpperCase()}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(entry.timestamp)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
