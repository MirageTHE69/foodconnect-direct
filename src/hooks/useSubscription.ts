import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionPlan {
  id: string;
  code: string;
  plan_type: 'free' | 'category_credit' | 'universal_tier';
  business_category: string | null;
  name: string;
  price_monthly: number;
  price_annual: number;
  gst_percent: number;
  credits_per_month: number | null;
  description: string | null;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  billing_cycle: string;
  status: string;
  starts_at: string;
  expires_at: string;
  payment_status: string;
  payment_reference: string | null;
  amount_paid: number | null;
  billing_state: string | null;
  taxable_value: number | null;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  gst_rate: number;
  invoice_number: string | null;
  is_trial: boolean;
  created_at: string;
  plan?: SubscriptionPlan;
}

/**
 * The signed-in user's access. `subscription` is what they have right now
 * (the free sign-up month, or a paid plan). `upcoming` is a paid plan bought
 * during the free month, which starts when the free month ends. Admins
 * always count as active. Cached with react-query so the route guard and the
 * pages behind it share one request.
 */
export function useSubscription() {
  const { user, userRole, loading: authLoading, rolesLoading } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = userRole === 'admin';

  const query = useQuery({
    queryKey: ['subscription', user?.id],
    enabled: !!user && !rolesLoading && !isAdmin,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false });
      if (error) throw error;

      const rows = (data ?? []) as unknown as UserSubscription[];
      const now = Date.now();
      const started = (s: UserSubscription) => !s.starts_at || new Date(s.starts_at).getTime() <= now;
      return {
        current: rows.find(started) ?? null,
        upcoming: rows.find((s) => !started(s)) ?? null,
      };
    },
  });

  const subscription = isAdmin ? null : query.data?.current ?? null;
  const upcoming = isAdmin ? null : query.data?.upcoming ?? null;
  const refetch = useCallback(() => queryClient.invalidateQueries({ queryKey: ['subscription'] }), [queryClient]);
  const loading = authLoading || (!!user && (rolesLoading || (!isAdmin && query.isPending)));

  return {
    subscription,
    upcoming,
    isTrial: !!subscription?.is_trial,
    hasActiveSubscription: !!user && (isAdmin || !!subscription),
    loading,
    refetch,
  };
}

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
      } else {
        setPlans((data ?? []) as SubscriptionPlan[]);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  return { plans, loading };
}

export type { SubscriptionPlan, UserSubscription };
