import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Layers, Rocket, Shield, LucideIcon } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ScriptCard } from '@/components/dashboard/ScriptCard';
import { categories, getScriptsByCategory, Category } from '@/data/scripts';

const iconMap: Record<Category, LucideIcon> = {
  users: Users,
  resources: Layers,
  deployment: Rocket,
  network: Shield,
};

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = categories.find(c => c.id === categoryId);
  const categoryScripts = categoryId ? getScriptsByCategory(categoryId as Category) : [];
  
  if (!category) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground">Catégorie non trouvée</h2>
          <Link to="/" className="text-primary hover:underline mt-2 inline-block">
            Retour au dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = iconMap[category.id as Category];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link 
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scripts Grid */}
        {categoryScripts.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Aucun script dans cette catégorie</h3>
            <p className="text-muted-foreground mt-1">Les scripts seront ajoutés prochainement</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {categoryScripts.map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
