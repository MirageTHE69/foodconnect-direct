import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat, Search, Loader2 } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: string | null;
  category: string | null;
  supplier_profiles: {
    id: string;
    company_name: string;
  } | null;
}

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    document.title = 'Recipes | FoodAdda';
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id, title, description, images, prep_time, cook_time, servings, difficulty, category,
          supplier_profiles ( id, company_name )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  // Categories are free-text from the admin, so group case-insensitively
  // ("sweets" / "Sweets") and show the first spelling seen.
  const categoryOptions = (() => {
    const map = new Map<string, string>();
    recipes.forEach((r) => {
      const label = r.category?.trim();
      if (label && !map.has(label.toLowerCase())) map.set(label.toLowerCase(), label);
    });
    return Array.from(map, ([key, label]) => ({ key, label })).sort((a, b) => a.label.localeCompare(b.label));
  })();

  const filteredRecipes = recipes.filter((recipe) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = recipe.title.toLowerCase().includes(q) || (recipe.description ?? '').toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'all' || recipe.category?.trim().toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 md:pt-20 container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Recipes</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover delicious recipes from our verified suppliers. Find inspiration for your next meal.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search recipes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>
          {categoryOptions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {[{ key: 'all', label: 'All' }, ...categoryOptions].map(({ key, label }) => (
                <Button
                  key={key}
                  size="sm"
                  variant="outline"
                  onClick={() => setCategoryFilter(key)}
                  className={
                    categoryFilter === key
                      ? 'text-foreground bg-primary border-primary hover:bg-primary hover:text-foreground'
                      : 'text-foreground border-foreground/30 bg-transparent hover:bg-primary/20 hover:text-foreground'
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : loadError ? (
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Couldn't load recipes</h2>
          <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
          <Button onClick={fetchRecipes}>Try again</Button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No recipes found</h2>
          <p className="text-muted-foreground">
            {searchQuery || categoryFilter !== 'all' ? 'Try adjusting your search or filters' : 'Check back soon for new recipes'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              description={recipe.description}
              images={recipe.images}
              prepTime={recipe.prep_time}
              cookTime={recipe.cook_time}
              servings={recipe.servings}
              difficulty={recipe.difficulty}
              category={recipe.category}
              supplierName={recipe.supplier_profiles?.company_name}
              supplierId={recipe.supplier_profiles?.id}
            />
          ))}
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
}
