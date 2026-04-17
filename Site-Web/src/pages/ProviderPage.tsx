import { useParams, Navigate } from 'react-router-dom';
import { Cloud, Server } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ScriptCard } from '@/components/dashboard/ScriptCard';
import { getScriptsByProvider, Provider } from '@/data/scripts';

const providerInfo: Record<Provider, { name: string; description: string; icon: typeof Cloud; color: string }> = {
  azure: {
    name: 'Microsoft Azure',
    description: 'Scripts pour la gestion et l\'automatisation des environnements Azure',
    icon: Cloud,
    color: 'text-blue-400 bg-blue-500/10',
  },
  aws: {
    name: 'Amazon Web Services',
    description: 'Scripts pour la gestion et l\'automatisation des environnements AWS',
    icon: Server,
    color: 'text-amber-400 bg-amber-500/10',
  },
};

export default function ProviderPage() {
  const { providerId } = useParams<{ providerId: string }>();
  if (providerId !== 'azure' && providerId !== 'aws') {
    return <Navigate to="/scripts" replace />;
  }
  const info = providerInfo[providerId];
  const Icon = info.icon;
  const list = getScriptsByProvider(providerId);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${info.color}`}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{info.name}</h1>
            <p className="mt-1 text-muted-foreground">{info.description}</p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Aucun script disponible</h3>
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
