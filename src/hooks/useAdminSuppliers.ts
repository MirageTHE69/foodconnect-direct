import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type SupplierProfile = Tables<'supplier_profiles'>;

interface SupplierWithEmail extends SupplierProfile {
  owner_email: string | null;
  owner_name: string | null;
}

export function useAdminSuppliers() {
  const queryClient = useQueryClient();

  const suppliersQuery = useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: async (): Promise<SupplierWithEmail[]> => {
      // Fetch supplier profiles
      const { data: suppliers, error: suppliersError } = await supabase
        .from('supplier_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (suppliersError) throw suppliersError;

      // Fetch profiles to get emails
      const userIds = suppliers?.map(s => s.user_id) ?? [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine data
      const profilesMap = new Map(profiles?.map(p => [p.user_id, { email: p.email, name: p.full_name }]) ?? []);

      return (suppliers ?? []).map(supplier => ({
        ...supplier,
        owner_email: profilesMap.get(supplier.user_id)?.email ?? null,
        owner_name: profilesMap.get(supplier.user_id)?.name ?? null,
      }));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ supplierId, status }: { supplierId: string; status: 'pending' | 'verified' | 'rejected' }) => {
      const { error } = await supabase
        .from('supplier_profiles')
        .update({ verification_status: status })
        .eq('id', supplierId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Supplier status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating supplier status:', error);
      toast.error('Failed to update supplier status');
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ supplierId, isFeatured }: { supplierId: string; isFeatured: boolean }) => {
      const { error } = await supabase
        .from('supplier_profiles')
        .update({ is_featured: isFeatured })
        .eq('id', supplierId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success('Supplier featured status updated');
    },
    onError: (error) => {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    },
  });

  return {
    suppliers: suppliersQuery.data ?? [],
    isLoading: suppliersQuery.isLoading,
    error: suppliersQuery.error,
    updateStatus: updateStatusMutation.mutate,
    toggleFeatured: toggleFeaturedMutation.mutate,
    isUpdating: updateStatusMutation.isPending || toggleFeaturedMutation.isPending,
  };
}
