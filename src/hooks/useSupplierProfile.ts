import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

type SupplierProfile = Tables<'supplier_profiles'>;
type SupplierProfileUpdate = TablesUpdate<'supplier_profiles'>;

export function useSupplierProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let { data, error } = await supabase
        .from('supplier_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Auto-create supplier profile if none exists (allows all users to post products)
      if (!data) {
        const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'My';
        const { data: newProfile, error: createError } = await supabase
          .from('supplier_profiles')
          .insert({ user_id: user.id, company_name: displayName + "'s Business" })
          .select()
          .single();
        
        if (createError) {
          console.error('Error auto-creating supplier profile:', createError);
        } else {
          data = newProfile;
        }
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching supplier profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: SupplierProfileUpdate) => {
    if (!user || !profile) return { error: new Error('No profile found') };

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('supplier_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully',
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive',
      });
      return { error };
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    updateProfile,
    refetch: fetchProfile,
  };
}
