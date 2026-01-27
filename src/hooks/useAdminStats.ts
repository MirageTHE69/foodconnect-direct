import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalSuppliers: number;
  totalProducts: number;
  pendingVerifications: number;
  pendingProducts: number;
  totalBuyers: number;
  verifiedSuppliers: number;
  approvedProducts: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Fetch all counts in parallel
      const [
        usersResult,
        suppliersResult,
        productsResult,
        pendingVerificationsResult,
        pendingProductsResult,
        buyersResult,
        verifiedSuppliersResult,
        approvedProductsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('supplier_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('supplier_profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'buyer'),
        supabase.from('supplier_profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      ]);

      return {
        totalUsers: usersResult.count ?? 0,
        totalSuppliers: suppliersResult.count ?? 0,
        totalProducts: productsResult.count ?? 0,
        pendingVerifications: pendingVerificationsResult.count ?? 0,
        pendingProducts: pendingProductsResult.count ?? 0,
        totalBuyers: buyersResult.count ?? 0,
        verifiedSuppliers: verifiedSuppliersResult.count ?? 0,
        approvedProducts: approvedProductsResult.count ?? 0,
      };
    },
  });
}
