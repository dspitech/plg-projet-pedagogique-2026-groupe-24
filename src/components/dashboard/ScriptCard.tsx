import { Link } from 'react-router-dom';
import { FileCode, Clock, CheckCircle2, Star, Cloud, Server } from 'lucide-react';
import { Script, Criticality } from '@/data/scripts';
import { cn } from '@/lib/utils';
import { useUserData } from '@/hooks/useUserData';

interface ScriptCardProps {
  script: Script;
}

const criticalityLabels: Record<Criticality, string> = {
  critical: 'Critique',
  high: 'Élevé',
  medium: 'Moyen',
  low: 'Faible',
};

const languageColors: Record<string, string> = {
  PowerShell: 'bg-blue-500/20 text-blue-400',
  'Azure CLI': 'bg-cyan-500/20 text-cyan-400',
  Bicep: 'bg-orange-500/20 text-orange-400',
  ARM: 'bg-purple-500/20 text-purple-400',
  'AWS CLI': 'bg-amber-500/20 text-amber-400',
  Terraform: 'bg-violet-500/20 text-violet-400',
  CloudFormation: 'bg-rose-500/20 text-rose-400',
};

export function ScriptCard({ script }: ScriptCardProps) {
  const { isFavorite, toggleFavorite } = useUserData();
  const fav = isFavorite(script.id);

  const ProviderIcon = script.provider === 'azure' ? Cloud : Server;

  return (
    <article className="script-card group relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(script.id);
        }}
        className={cn(
          'absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors',
          fav
            ? 'bg-warning/20 text-warning'
            : 'bg-secondary/50 text-muted-foreground hover:text-warning hover:bg-warning/10'
        )}
        aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Star className={cn('h-4 w-4', fav && 'fill-current')} />
      </button>

      <Link to={`/script/${script.id}`} className="block">
        <div className="flex items-start gap-3 pr-10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <FileCode className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {script.name}
              </h3>
              {script.validated && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{script.description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="category-badge gap-1">
            <ProviderIcon className="h-3 w-3" />
            {script.provider.toUpperCase()}
          </span>
          <span className={cn('category-badge', languageColors[script.language])}>
            {script.language}
          </span>
          <span className={cn('criticality-badge', `criticality-${script.criticality}`)}>
            {criticalityLabels[script.criticality]}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            v{script.version}
          </span>
          <span className="truncate ml-2">{script.author}</span>
        </div>
      </Link>
    </article>
  );
}
