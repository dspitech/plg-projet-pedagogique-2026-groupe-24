import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ScriptCard } from '@/components/dashboard/ScriptCard';
import { scripts, categories, Criticality, Category } from '@/data/scripts';
import { cn } from '@/lib/utils';

const criticalityOptions: { value: Criticality | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'critical', label: 'Critique' },
  { value: 'high', label: 'Élevé' },
  { value: 'medium', label: 'Moyen' },
  { value: 'low', label: 'Faible' },
];

const languageOptions = ['Tous', 'PowerShell', 'Azure CLI', 'Bicep', 'ARM'];

export default function ScriptsPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedCriticality, setSelectedCriticality] = useState<Criticality | 'all'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState('Tous');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredScripts = useMemo(() => {
    return scripts.filter(script => {
      const matchesSearch = searchQuery === '' || 
        script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || script.category === selectedCategory;
      const matchesCriticality = selectedCriticality === 'all' || script.criticality === selectedCriticality;
      const matchesLanguage = selectedLanguage === 'Tous' || script.language === selectedLanguage;

      return matchesSearch && matchesCategory && matchesCriticality && matchesLanguage;
    });
  }, [searchQuery, selectedCategory, selectedCriticality, selectedLanguage]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bibliothèque de Scripts</h1>
          <p className="mt-1 text-muted-foreground">Consultez et filtrez les scripts disponibles</p>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un script..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-10 w-full"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
              className="search-input w-full lg:w-48"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Criticality Filter */}
            <select
              value={selectedCriticality}
              onChange={(e) => setSelectedCriticality(e.target.value as Criticality | 'all')}
              className="search-input w-full lg:w-40"
            >
              {criticalityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="search-input w-full lg:w-40"
            >
              {languageOptions.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded transition-colors",
                  viewMode === 'grid' ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded transition-colors",
                  viewMode === 'list' ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredScripts.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Aucun script trouvé</h3>
            <p className="text-muted-foreground mt-1">Essayez de modifier vos filtres de recherche</p>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              : "flex flex-col gap-3"
          )}>
            {filteredScripts.map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
