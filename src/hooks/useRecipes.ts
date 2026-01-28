import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Recipe = Tables<'recipes'>;
type RecipeInsert = TablesInsert<'recipes'>;
type RecipeUpdate = TablesUpdate<'recipes'>;
type RecipeIngredient = Tables<'recipe_ingredients'>;

interface RecipeWithDetails extends Recipe {
  supplier_profiles?: {
    id: string;
    company_name: string;
    logo_url: string | null;
    city: string | null;
    state: string | null;
    verification_status: string;
  } | null;
  recipe_ingredients?: RecipeIngredient[];
}

interface IngredientInput {
  id?: string;
  ingredient_name: string;
  quantity: string;
  unit: string;
  product_id: string | null;
}

export function useRecipes(supplierId?: string) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, [supplierId]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);

      let query = supabase
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
        .order('created_at', { ascending: false });

      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recipes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecipe = async (recipeId: string) => {
    try {
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          supplier_profiles (
            id,
            company_name,
            logo_url,
            city,
            state,
            verification_status,
            business_description
          )
        `)
        .eq('id', recipeId)
        .maybeSingle();

      if (recipeError) throw recipeError;

      if (recipe) {
        // Fetch ingredients separately
        const { data: ingredients, error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .select('*')
          .eq('recipe_id', recipeId)
          .order('created_at', { ascending: true });

        if (ingredientsError) throw ingredientsError;

        return {
          data: { ...recipe, recipe_ingredients: ingredients || [] },
          error: null,
        };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Error fetching recipe:', error);
      return { data: null, error };
    }
  };

  const createRecipe = async (
    recipe: Omit<RecipeInsert, 'supplier_id'>,
    ingredients: IngredientInput[]
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      setSaving(true);

      // Get supplier profile ID
      const { data: supplierProfile, error: profileError } = await supabase
        .from('supplier_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !supplierProfile) {
        throw new Error('Supplier profile not found');
      }

      // Create recipe
      const { data: newRecipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          ...recipe,
          supplier_id: supplierProfile.id,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Create ingredients
      if (ingredients.length > 0) {
        const ingredientsToInsert = ingredients
          .filter((ing) => ing.ingredient_name.trim())
          .map((ing) => ({
            recipe_id: newRecipe.id,
            ingredient_name: ing.ingredient_name.trim(),
            quantity: ing.quantity || null,
            unit: ing.unit || null,
            product_id: ing.product_id || null,
          }));

        if (ingredientsToInsert.length > 0) {
          const { error: ingredientsError } = await supabase
            .from('recipe_ingredients')
            .insert(ingredientsToInsert);

          if (ingredientsError) throw ingredientsError;
        }
      }

      await fetchRecipes();
      toast({
        title: 'Recipe created',
        description: 'Your recipe has been added successfully',
      });

      return { data: newRecipe, error: null };
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to create recipe',
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setSaving(false);
    }
  };

  const updateRecipe = async (
    recipeId: string,
    updates: RecipeUpdate,
    ingredients: IngredientInput[]
  ) => {
    try {
      setSaving(true);

      // Update recipe
      const { data, error: recipeError } = await supabase
        .from('recipes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recipeId)
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Delete existing ingredients and re-insert
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);

      if (ingredients.length > 0) {
        const ingredientsToInsert = ingredients
          .filter((ing) => ing.ingredient_name.trim())
          .map((ing) => ({
            recipe_id: recipeId,
            ingredient_name: ing.ingredient_name.trim(),
            quantity: ing.quantity || null,
            unit: ing.unit || null,
            product_id: ing.product_id || null,
          }));

        if (ingredientsToInsert.length > 0) {
          const { error: ingredientsError } = await supabase
            .from('recipe_ingredients')
            .insert(ingredientsToInsert);

          if (ingredientsError) throw ingredientsError;
        }
      }

      await fetchRecipes();
      toast({
        title: 'Recipe updated',
        description: 'Your recipe has been saved successfully',
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to update recipe',
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setSaving(false);
    }
  };

  const deleteRecipe = async (recipeId: string) => {
    try {
      // Delete ingredients first (cascade should handle this, but being explicit)
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);

      const { error } = await supabase.from('recipes').delete().eq('id', recipeId);

      if (error) throw error;

      await fetchRecipes();
      toast({
        title: 'Recipe deleted',
        description: 'Your recipe has been removed',
      });

      return { error: null };
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete recipe',
        variant: 'destructive',
      });
      return { error };
    }
  };

  return {
    recipes,
    loading,
    saving,
    getRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    refetch: fetchRecipes,
  };
}
