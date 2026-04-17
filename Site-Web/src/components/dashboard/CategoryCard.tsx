import { Link } from 'react-router-dom';
import { Users, Layers, Rocket, Shield, ArrowRight, LucideIcon } from 'lucide-react';
import { Category } from '@/data/scripts';

interface CategoryCardProps {
  id: Category;
  name: string;
  description: string;
}

const iconMap: Record<Category, LucideIcon> = {
  users: Users,
  resources: Layers,
  deployment: Rocket,
  network: Shield,
};

const gradientMap: Record<Category, string> = {
  users: 'from-blue-500/20 to-blue-600/5',
  resources: 'from-emerald-500/20 to-emerald-600/5',
  deployment: 'from-orange-500/20 to-orange-600/5',
  network: 'from-rose-500/20 to-rose-600/5',
};

const iconColorMap: Record<Category, string> = {
  users: 'bg-blue-500/20 text-blue-400',
  resources: 'bg-emerald-500/20 text-emerald-400',
  deployment: 'bg-orange-500/20 text-orange-400',
  network: 'bg-rose-500/20 text-rose-400',
};

export function CategoryCard({ id, name, description }: CategoryCardProps) {
  const Icon = iconMap[id];

  return (
    <Link 
      to={`/category/${id}`}
      className="group block"
    >
      <div className={`script-card bg-gradient-to-br ${gradientMap[id]} h-full`}>
        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColorMap[id]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
