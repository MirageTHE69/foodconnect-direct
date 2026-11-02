import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type RegistrationProfile = Tables<'registration_profiles'>;
export type SupplierProfile = Tables<'supplier_profiles'>;

export interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  role: 'buyer' | 'supplier' | 'admin' | null;
  registration: RegistrationProfile | null;
  supplier: SupplierProfile | null;
}

export interface SaveUserDetailsInput {
  userId: string;
  profile: { full_name: string | null; phone: string | null };
  /** Fields for registration_profiles. Inserted when the user has none yet. */
  registration: TablesUpdate<'registration_profiles'> | null;
  registrationId: string | null;
  supplier: TablesUpdate<'supplier_profiles'> | null;
  supplierId: string | null;
}

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<UserWithRole[]> => {
      const [profilesRes, rolesRes, registrationsRes, suppliersRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('registration_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('supplier_profiles').select('*'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (registrationsRes.error) throw registrationsRes.error;
      if (suppliersRes.error) throw suppliersRes.error;

      const rolesMap = new Map(rolesRes.data?.map(r => [r.user_id, r.role]) ?? []);
      // Newest registration wins if a user somehow has more than one.
      const registrationMap = new Map<string, RegistrationProfile>();
      for (const r of registrationsRes.data ?? []) {
        if (r.user_id && !registrationMap.has(r.user_id)) registrationMap.set(r.user_id, r);
      }
      const supplierMap = new Map((suppliersRes.data ?? []).map(s => [s.user_id, s]));

      return (profilesRes.data ?? []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        role: rolesMap.get(profile.user_id) as 'buyer' | 'supplier' | 'admin' | null,
        registration: registrationMap.get(profile.user_id) ?? null,
        supplier: supplierMap.get(profile.user_id) ?? null,
      }));
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'buyer' | 'supplier' | 'admin' }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    },
  });

  const saveDetailsMutation = useMutation({
    mutationFn: async (input: SaveUserDetailsInput) => {
      if (input.registration) {
        if (input.registrationId) {
          const { error } = await supabase
            .from('registration_profiles')
            .update(input.registration)
            .eq('id', input.registrationId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('registration_profiles')
            .insert({ ...input.registration, user_id: input.userId } as TablesInsert<'registration_profiles'>);
          if (error) throw error;
        }
      }

      if (input.supplier && input.supplierId) {
        const { error } = await supabase
          .from('supplier_profiles')
          .update(input.supplier)
          .eq('id', input.supplierId);
        if (error) throw error;
      }

      // Last, because the registration trigger copies its phone into profiles;
      // this keeps the account phone the admin typed.
      const { error: profileError } = await supabase
        .from('profiles')
        .update(input.profile)
        .eq('user_id', input.userId);
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User details saved');
    },
    onError: (error) => {
      console.error('Error saving user details:', error);
      toast.error(error instanceof Error ? `Could not save: ${error.message}` : 'Could not save user details');
    },
  });

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    updateRole: updateRoleMutation.mutate,
    isUpdating: updateRoleMutation.isPending,
    saveDetails: saveDetailsMutation.mutateAsync,
    isSaving: saveDetailsMutation.isPending,
  };
}
