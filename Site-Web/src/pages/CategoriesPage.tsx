import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CategoryCard } from '@/components/dashboard/CategoryCard';
import { categories, Category } from '@/data/scripts';

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catégories</h1>
          <p className="mt-1 text-muted-foreground">
            Explorez les scripts organisés par domaine d'administration
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              id={cat.id as Category}
              name={cat.name}
              description={cat.description}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
