import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

interface ProductWithSupplier extends Product {
  supplier_name: string | null;
  category_name: string | null;
}

export function useAdminProducts() {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: async (): Promise<ProductWithSupplier[]> => {
      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch supplier profiles
      const supplierIds = [...new Set(products?.map(p => p.supplier_id) ?? [])];
      const { data: suppliers, error: suppliersError } = await supabase
        .from('supplier_profiles')
        .select('id, company_name')
        .in('id', supplierIds);

      if (suppliersError) throw suppliersError;

      // Fetch categories
      const categoryIds = [...new Set(products?.filter(p => p.category_id).map(p => p.category_id!) ?? [])];
      let categoriesMap = new Map<string, string>();
      
      if (categoryIds.length > 0) {
        const { data: categories, error: categoriesError } = await supabase
          .from('product_categories')
          .select('id, name')
          .in('id', categoryIds);

        if (categoriesError) throw categoriesError;
        categoriesMap = new Map(categories?.map(c => [c.id, c.name]) ?? []);
      }

      // Combine data
      const suppliersMap = new Map(suppliers?.map(s => [s.id, s.company_name]) ?? []);

      return (products ?? []).map(product => ({
        ...product,
        supplier_name: suppliersMap.get(product.supplier_id) ?? null,
        category_name: product.category_id ? categoriesMap.get(product.category_id) ?? null : null,
      }));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ productId, status }: { productId: string; status: 'pending' | 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Product status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ productId, isFeatured }: { productId: string; isFeatured: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: isFeatured })
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product featured status updated');
    },
    onError: (error) => {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    },
  });

  return {
    products: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    updateStatus: updateStatusMutation.mutate,
    toggleFeatured: toggleFeaturedMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    isUpdating: updateStatusMutation.isPending || toggleFeaturedMutation.isPending || deleteProductMutation.isPending,
  };
}
