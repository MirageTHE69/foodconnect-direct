import { useState, useEffect } from 'react';
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
  status: string;
  starts_at: string;
  expires_at: string;
  payment_id: string | null;
  payment_status: string;
  created_at: string;
  plan?: SubscriptionPlan;
}

export function useSubscription() {
  const { user, userRole } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setHasActiveSubscription(false);
      setLoading(false);
      return;
    }

    // Admins bypass subscription check
    if (userRole === 'admin') {
      setHasActiveSubscription(true);
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user, userRole]);

  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setHasActiveSubscription(false);
      } else if (data) {
        setSubscription(data as UserSubscription);
        setHasActiveSubscription(true);
      } else {
        setSubscription(null);
        setHasActiveSubscription(false);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  return { subscription, hasActiveSubscription, loading, refetch: fetchSubscription };
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
