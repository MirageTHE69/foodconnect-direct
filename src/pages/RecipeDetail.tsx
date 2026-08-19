import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChefHat,
  Clock,
  Users,
  Loader2,
  Store,
  CheckCircle,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface RecipeDetail {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: string | null;
  instructions: string | null;
  tags: string[] | null;
  supplier_profiles: {
    id: string;
    company_name: string;
    logo_url: string | null;
    city: string | null;
    state: string | null;
    verification_status: string;
  } | null;
}

interface Ingredient {
  id: string;
  ingredient_name: string;
  quantity: string | null;
  unit: string | null;
  product_id: string | null;
  products?: {
    id: string;
    name: string;
  } | null;
}

interface RelatedRecipe {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: string | null;
  supplier_profiles: {
    id: string;
    company_name: string;
  } | null;
}

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [relatedRecipes, setRelatedRecipes] = useState<RelatedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchRecipeDetails(id);
    }
  }, [id]);

  const fetchRecipeDetails = async (recipeId: string) => {
    setLoading(true);
    try {
      // Fetch recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          supplier_profiles (
            id,
            company_name,
            logo_url,
            city,
            state,
            verification_status
          )
        `)
        .eq('id', recipeId)
        .single();

      if (recipeError) throw recipeError;
      setRecipe(recipeData);

      // Fetch ingredients with product info
      const { data: ingredientsData } = await supabase
        .from('recipe_ingredients')
        .select(`
          id,
          ingredient_name,
          quantity,
          unit,
          product_id,
          products (
            id,
            name
          )
        `)
        .eq('recipe_id', recipeId);

      setIngredients(ingredientsData || []);

      // Fetch related recipes from same supplier
      if (recipeData.supplier_id) {
        const { data: relatedData } = await supabase
          .from('recipes')
          .select(`
            id,
            title,
            description,
            images,
            prep_time,
            cook_time,
            servings,
            difficulty,
            supplier_profiles (
              id,
              company_name
            )
          `)
          .eq('supplier_id', recipeData.supplier_id)
          .eq('status', 'approved')
          .neq('id', recipeId)
          .limit(4);

        setRelatedRecipes(relatedData || []);
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <ChefHat className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Recipe Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The recipe you're looking for doesn't exist
        </p>
        <Button asChild>
          <Link to="/recipes">Browse Recipes</Link>
        </Button>
      </div>
    );
  }

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const supplier = recipe.supplier_profiles;
  const supplierLocation = supplier
    ? [supplier.city, supplier.state].filter(Boolean).join(', ')
    : '';
  const isVerified = supplier?.verification_status === 'verified';

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">FoodAdda</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/products">
                <Button variant="ghost">Products</Button>
              </Link>
              <Link to="/suppliers">
                <Button variant="ghost">Suppliers</Button>
              </Link>
              <Link to="/recipes">
                <Button variant="ghost">Recipes</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link to="/recipes" className="hover:text-foreground">
            Recipes
          </Link>
          <span>/</span>
          <span className="text-foreground">{recipe.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                {recipe.images && recipe.images[selectedImage] ? (
                  <img
                    src={recipe.images[selectedImage]}
                    alt={recipe.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat className="h-24 w-24 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              {recipe.images && recipe.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {recipe.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                    >
                      <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {recipe.difficulty && (
                  <Badge className={getDifficultyColor(recipe.difficulty)}>
                    {recipe.difficulty}
                  </Badge>
                )}
                {recipe.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-muted-foreground text-lg">{recipe.description}</p>
              )}

              {/* Info Pills */}
              <div className="flex flex-wrap gap-4 mt-4">
                {recipe.prep_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Prep: {recipe.prep_time} min</span>
                  </div>
                )}
                {recipe.cook_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Cook: {recipe.cook_time} min</span>
                  </div>
                )}
                {totalTime > 0 && (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Total: {totalTime} min</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{recipe.servings} servings</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
                  <ul className="space-y-2">
                    {ingredients.map((ing) => (
                      <li key={ing.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span>
                          {ing.quantity && <span className="font-medium">{ing.quantity}</span>}{' '}
                          {ing.unit && <span className="text-muted-foreground">{ing.unit}</span>}{' '}
                          {ing.ingredient_name}
                        </span>
                        {ing.products && (
                          <Link
                            to={`/products/${ing.products.id}`}
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            View Product
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            {recipe.instructions && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                  <div className="prose prose-sm max-w-none">
                    {recipe.instructions.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">
                        {line}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Supplier Card */}
            {supplier && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Recipe by</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {supplier.logo_url ? (
                        <img
                          src={supplier.logo_url}
                          alt={supplier.company_name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/suppliers/${supplier.id}`}
                          className="font-semibold hover:text-primary"
                        >
                          {supplier.company_name}
                        </Link>
                        {isVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      {supplierLocation && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {supplierLocation}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4">
                    <Link to={`/suppliers/${supplier.id}`}>View Supplier</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Related Recipes */}
        {relatedRecipes.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">More from {supplier?.company_name}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedRecipes.map((relRecipe) => (
                <RecipeCard
                  key={relRecipe.id}
                  id={relRecipe.id}
                  title={relRecipe.title}
                  description={relRecipe.description}
                  images={relRecipe.images}
                  prepTime={relRecipe.prep_time}
                  cookTime={relRecipe.cook_time}
                  servings={relRecipe.servings}
                  difficulty={relRecipe.difficulty}
                  supplierName={relRecipe.supplier_profiles?.company_name}
                  supplierId={relRecipe.supplier_profiles?.id}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
