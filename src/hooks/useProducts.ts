import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type ProductInsert = TablesInsert<'products'>;
type ProductUpdate = TablesUpdate<'products'>;
type ProductCategory = Tables<'product_categories'>;

interface ProductWithDetails extends Product {
  supplier_profiles?: {
    id: string;
    company_name: string;
    logo_url: string | null;
    city: string | null;
    state: string | null;
    verification_status: string;
  } | null;
  product_categories?: {
    id: string;
    name: string;
  } | null;
}

export function useProducts(supplierId?: string) {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          supplier_profiles (
            id,
            company_name,
            logo_url,
            city,
            state,
            verification_status
          ),
          product_categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const getProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
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
          ),
          product_categories (
            id,
            name
          )
        `)
        .eq('id', productId)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { data: null, error };
    }
  };

  const createProduct = async (product: Omit<ProductInsert, 'supplier_id'>) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a product',
        variant: 'destructive',
      });
      return { data: null, error: new Error('Not authenticated') };
    }

    try {
      setSaving(true);
      
      // Get supplier profile ID
      const { data: supplierProfile, error: profileError } = await supabase
        .from('supplier_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !supplierProfile) {
        toast({
          title: 'Error',
          description: 'Supplier profile not found. Please complete your profile first.',
          variant: 'destructive',
        });
        return { data: null, error: new Error('Supplier profile not found') };
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...product,
          supplier_id: supplierProfile.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      toast({
        title: 'Product created',
        description: 'Your product has been added successfully',
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = async (productId: string, updates: ProductUpdate) => {
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      toast({
        title: 'Product updated',
        description: 'Your product has been saved successfully',
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      await fetchProducts();
      toast({
        title: 'Product deleted',
        description: 'Your product has been removed',
      });

      return { error: null };
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
      return { error };
    }
  };

  return {
    products,
    categories,
    loading,
    saving,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}
