import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SavedProduct {
  id: string;
  product_id: string;
  products?: {
    id: string;
    name: string;
    description: string | null;
    images: string[] | null;
    supplier_profiles?: {
      id: string;
      company_name: string;
    } | null;
    product_categories?: {
      id: string;
      name: string;
    } | null;
  };
}

interface SavedSupplier {
  id: string;
  supplier_id: string;
  supplier_profiles?: {
    id: string;
    company_name: string;
    business_description: string | null;
    logo_url: string | null;
    city: string | null;
    state: string | null;
    verification_status: string;
  };
}

export function useSavedItems() {
  const { user } = useAuth();
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [savedSuppliers, setSavedSuppliers] = useState<SavedSupplier[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<Set<string>>(new Set());
  const [savedSupplierIds, setSavedSupplierIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedItems();
    } else {
      setSavedProducts([]);
      setSavedSuppliers([]);
      setSavedProductIds(new Set());
      setSavedSupplierIds(new Set());
      setLoading(false);
    }
  }, [user]);

  const fetchSavedItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch saved products
      const { data: productsData, error: productsError } = await supabase
        .from('saved_products')
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            description,
            images,
            supplier_profiles (
              id,
              company_name
            ),
            product_categories (
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id);

      if (productsError) throw productsError;

      // Fetch saved suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('saved_suppliers')
        .select(`
          id,
          supplier_id,
          supplier_profiles (
            id,
            company_name,
            business_description,
            logo_url,
            city,
            state,
            verification_status
          )
        `)
        .eq('user_id', user.id);

      if (suppliersError) throw suppliersError;

      setSavedProducts(productsData || []);
      setSavedSuppliers(suppliersData || []);
      setSavedProductIds(new Set((productsData || []).map(p => p.product_id)));
      setSavedSupplierIds(new Set((suppliersData || []).map(s => s.supplier_id)));
    } catch (error) {
      console.error('Error fetching saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveProduct = async (productId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save products',
        variant: 'destructive',
      });
      return;
    }

    const isSaved = savedProductIds.has(productId);

    try {
      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_products')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setSavedProductIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        setSavedProducts(prev => prev.filter(p => p.product_id !== productId));

        toast({
          title: 'Removed from saved',
          description: 'Product removed from your saved items',
        });
      } else {
        // Add to saved
        const { data, error } = await supabase
          .from('saved_products')
          .insert({ user_id: user.id, product_id: productId })
          .select()
          .single();

        if (error) throw error;

        setSavedProductIds(prev => new Set([...prev, productId]));
        
        toast({
          title: 'Saved',
          description: 'Product added to your saved items',
        });

        // Refetch to get full product details
        await fetchSavedItems();
      }
    } catch (error) {
      console.error('Error toggling save product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update saved items',
        variant: 'destructive',
      });
    }
  };

  const toggleSaveSupplier = async (supplierId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save suppliers',
        variant: 'destructive',
      });
      return;
    }

    const isSaved = savedSupplierIds.has(supplierId);

    try {
      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_suppliers')
          .delete()
          .eq('user_id', user.id)
          .eq('supplier_id', supplierId);

        if (error) throw error;

        setSavedSupplierIds(prev => {
          const next = new Set(prev);
          next.delete(supplierId);
          return next;
        });
        setSavedSuppliers(prev => prev.filter(s => s.supplier_id !== supplierId));

        toast({
          title: 'Removed from saved',
          description: 'Supplier removed from your saved items',
        });
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_suppliers')
          .insert({ user_id: user.id, supplier_id: supplierId })
          .select()
          .single();

        if (error) throw error;

        setSavedSupplierIds(prev => new Set([...prev, supplierId]));
        
        toast({
          title: 'Saved',
          description: 'Supplier added to your saved items',
        });

        // Refetch to get full supplier details
        await fetchSavedItems();
      }
    } catch (error) {
      console.error('Error toggling save supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to update saved items',
        variant: 'destructive',
      });
    }
  };

  const isProductSaved = (productId: string) => savedProductIds.has(productId);
  const isSupplierSaved = (supplierId: string) => savedSupplierIds.has(supplierId);

  return {
    savedProducts,
    savedSuppliers,
    loading,
    toggleSaveProduct,
    toggleSaveSupplier,
    isProductSaved,
    isSupplierSaved,
    refetch: fetchSavedItems,
  };
}
