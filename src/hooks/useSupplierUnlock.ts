import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

/**
 * Wraps the (previously dormant) unlock_supplier() RPC and
 * supplier_unlocks table: spends one credit from the buyer's
 * category-credit plan to reveal a specific supplier's "limited" fields
 * for the current calendar month. Universal-tier/admin users never need
 * this (they already get 'full' access from usePermissions()).
 */
export function useSupplierUnlock(supplierId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const checkUnlocked = useCallback(async () => {
    if (!user || !supplierId) {
      setChecking(false);
      return;
    }
    setChecking(true);
    const billingPeriodStart = new Date();
    billingPeriodStart.setDate(1);
    const { data } = await supabase
      .from('supplier_unlocks')
      .select('id')
      .eq('buyer_user_id', user.id)
      .eq('supplier_id', supplierId)
      .eq('billing_period_start', billingPeriodStart.toISOString().slice(0, 10))
      .maybeSingle();
    setUnlocked(!!data);
    setChecking(false);
  }, [user, supplierId]);

  useEffect(() => {
    checkUnlocked();
  }, [checkUnlocked]);

  const unlock = async () => {
    if (!user || !supplierId) return;
    setUnlocking(true);
    try {
      const { data, error } = await supabase.rpc('unlock_supplier', { _supplier_id: supplierId });
      if (error) throw error;

      const result = data?.[0];
      if (!result) throw new Error('No response from server');

      if (result.unlocked) {
        setUnlocked(true);
        setCreditsRemaining(result.credits_remaining);
        if (result.reason === 'ok' || result.reason === 'unlimited') {
          toast({ title: 'Unlocked!', description: 'Full supplier details are now visible.' });
        }
      } else if (result.reason === 'limit_reached') {
        toast({
          variant: 'destructive',
          title: 'Monthly credit limit reached',
          description: 'Upgrade your plan for more unlocks, or wait until next month.',
        });
      } else if (result.reason === 'no_active_subscription') {
        toast({
          variant: 'destructive',
          title: 'No active subscription',
          description: 'Subscribe to a plan to unlock supplier details.',
        });
      } else {
        toast({ variant: 'destructive', title: 'Could not unlock', description: result.reason });
      }
    } catch (err) {
      console.error('Error unlocking supplier:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to unlock supplier details.' });
    } finally {
      setUnlocking(false);
    }
  };

  return { unlocked, checking, unlocking, creditsRemaining, unlock };
}
