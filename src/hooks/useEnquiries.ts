import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Enquiry = Tables<'enquiries'>;

interface EnquiryWithDetails extends Enquiry {
  products?: {
    id: string;
    name: string;
    images: string[] | null;
  } | null;
  buyer_profile?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export function useEnquiries() {
  const { user, userRole } = useAuth();
  const [enquiries, setEnquiries] = useState<EnquiryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnquiries();
    }
  }, [user, userRole]);

  const fetchEnquiries = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (userRole === 'supplier') {
        // Get supplier profile ID first
        const { data: supplierProfile, error: profileError } = await supabase
          .from('supplier_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profileError || !supplierProfile) {
          setEnquiries([]);
          return;
        }

        const { data, error } = await supabase
          .from('enquiries')
          .select(`
            *,
            products (
              id,
              name,
              images
            )
          `)
          .eq('supplier_id', supplierProfile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch buyer profiles separately
        const buyerIds = [...new Set((data || []).map(e => e.buyer_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', buyerIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const enquiriesWithBuyers = (data || []).map(enquiry => ({
          ...enquiry,
          buyer_profile: profileMap.get(enquiry.buyer_id) || null,
        }));

        setEnquiries(enquiriesWithBuyers);
      } else if (userRole === 'buyer') {
        const { data, error } = await supabase
          .from('enquiries')
          .select(`
            *,
            products (
              id,
              name,
              images
            )
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEnquiries(data || []);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load enquiries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createEnquiry = async (
    supplierId: string,
    subject: string,
    message: string,
    productId?: string
  ) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to send enquiries',
        variant: 'destructive',
      });
      return { error: new Error('Not authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from('enquiries')
        .insert({
          buyer_id: user.id,
          supplier_id: supplierId,
          subject,
          message,
          product_id: productId || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Enquiry sent',
        description: 'Your enquiry has been sent to the supplier',
      });

      await fetchEnquiries();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating enquiry:', error);
      toast({
        title: 'Error',
        description: 'Failed to send enquiry',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateEnquiryStatus = async (enquiryId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', enquiryId);

      if (error) throw error;

      toast({
        title: 'Status updated',
        description: `Enquiry marked as ${status}`,
      });

      await fetchEnquiries();
      return { error: null };
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
      return { error };
    }
  };

  return {
    enquiries,
    loading,
    createEnquiry,
    updateEnquiryStatus,
    refetch: fetchEnquiries,
  };
}
