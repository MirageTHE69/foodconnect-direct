import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { MultiImageUpload } from '@/components/shared/MultiImageUpload';
import { IngredientInput } from '@/components/recipes/IngredientInput';
import { useRecipes } from '@/hooks/useRecipes';
import { useProducts } from '@/hooks/useProducts';
import { useSupplierProfile } from '@/hooks/useSupplierProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, ArrowLeft, X, Plus } from 'lucide-react';

interface Ingredient {
  id?: string;
  ingredient_name: string;
  quantity: string;
  unit: string;
  product_id: string | null;
}

export default function RecipeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const { profile } = useSupplierProfile();
  const { getRecipe, createRecipe, updateRecipe, saving } = useRecipes();
  const { products } = useProducts(profile?.id);
  const [loading, setLoading] = useState(!isNew);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prep_time: '',
    cook_time: '',
    servings: '',
    difficulty: '',
    images: [] as string[],
    instructions: '',
    tags: [] as string[],
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { ingredient_name: '', quantity: '', unit: '', product_id: null },
  ]);

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!isNew && id) {
      loadRecipe(id);
    }
  }, [id, isNew]);

  const loadRecipe = async (recipeId: string) => {
    setLoading(true);
    const { data } = await getRecipe(recipeId);
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        prep_time: data.prep_time?.toString() || '',
        cook_time: data.cook_time?.toString() || '',
        servings: data.servings?.toString() || '',
        difficulty: data.difficulty || '',
        images: data.images || [],
        instructions: data.instructions || '',
        tags: data.tags || [],
      });

      if (data.recipe_ingredients && data.recipe_ingredients.length > 0) {
        setIngredients(
          data.recipe_ingredients.map((ing) => ({
            id: ing.id,
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity || '',
            unit: ing.unit || '',
            product_id: ing.product_id,
          }))
        );
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const recipeData = {
      title: formData.title,
      description: formData.description || null,
      prep_time: formData.prep_time ? parseInt(formData.prep_time) : null,
      cook_time: formData.cook_time ? parseInt(formData.cook_time) : null,
      servings: formData.servings ? parseInt(formData.servings) : null,
      difficulty: formData.difficulty || null,
      images: formData.images.length > 0 ? formData.images : null,
      instructions: formData.instructions || null,
      tags: formData.tags.length > 0 ? formData.tags : null,
    };

    const validIngredients = ingredients.filter((ing) => ing.ingredient_name.trim());

    if (isNew) {
      const { data, error } = await createRecipe(recipeData, validIngredients);
      if (!error && data) {
        navigate('/supplier/recipes');
      }
    } else if (id) {
      const { error } = await updateRecipe(id, recipeData, validIngredients);
      if (!error) {
        navigate('/supplier/recipes');
      }
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { ingredient_name: '', quantity: '', unit: '', product_id: null },
    ]);
  };

  const handleUpdateIngredient = (
    index: number,
    field: 'ingredient_name' | 'quantity' | 'unit' | 'product_id',
    value: string | null
  ) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/supplier/recipes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isNew ? 'Add New Recipe' : 'Edit Recipe'}</h1>
            <p className="text-muted-foreground">
              {isNew ? 'Create a new recipe' : 'Update recipe details'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Recipe title and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Recipe Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="mt-1"
                  placeholder="Enter recipe title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                  className="mt-1"
                  placeholder="Briefly describe the recipe..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Recipe Details</CardTitle>
              <CardDescription>Cooking times and serving info</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prep_time">Prep Time (minutes)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    min="0"
                    value={formData.prep_time}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, prep_time: e.target.value }))
                    }
                    className="mt-1"
                    placeholder="15"
                  />
                </div>
                <div>
                  <Label htmlFor="cook_time">Cook Time (minutes)</Label>
                  <Input
                    id="cook_time"
                    type="number"
                    min="0"
                    value={formData.cook_time}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, cook_time: e.target.value }))
                    }
                    className="mt-1"
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, servings: e.target.value }))
                    }
                    className="mt-1"
                    placeholder="4"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Recipe Images</CardTitle>
              <CardDescription>
                Upload up to 5 images. First image will be the cover.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultiImageUpload
                bucket="recipes"
                currentImages={formData.images}
                maxImages={5}
                onImagesChange={(urls) => setFormData((prev) => ({ ...prev, images: urls }))}
              />
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>
                List all ingredients. Optionally link to your products.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <IngredientInput
                  key={index}
                  ingredientName={ingredient.ingredient_name}
                  quantity={ingredient.quantity}
                  unit={ingredient.unit}
                  productId={ingredient.product_id}
                  products={products.map((p) => ({ id: p.id, name: p.name }))}
                  onUpdate={(field, value) => handleUpdateIngredient(index, field, value)}
                  onRemove={() => handleRemoveIngredient(index)}
                />
              ))}
              <Button type="button" variant="outline" onClick={handleAddIngredient}>
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>Step-by-step cooking instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.instructions}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, instructions: e.target.value }))
                }
                rows={8}
                placeholder="Step 1: Preheat the oven to 350°F...&#10;Step 2: Mix the dry ingredients...&#10;Step 3: ..."
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add tags to help users find your recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/supplier/recipes')}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isNew ? 'Create Recipe' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
