import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Watches a single user_subscriptions row for the Cashfree webhook flipping
 * it to 'active'. Uses Realtime as the primary signal with a short polling
 * fallback, since the webhook can land slightly before or after the
 * Realtime subscription is fully established.
 */
export function useSubscriptionActivationWatcher(
  subscriptionId: string | null,
  onActive: () => void,
) {
  useEffect(() => {
    if (!subscriptionId) return;

    let cancelled = false;

    const channel = supabase
      .channel(`sub-activation-${subscriptionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `id=eq.${subscriptionId}`,
        },
        (payload) => {
          if (!cancelled && payload.new.status === 'active') {
            onActive();
          }
        },
      )
      .subscribe();

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('user_subscriptions')
        .select('status')
        .eq('id', subscriptionId)
        .maybeSingle();
      if (!cancelled && data?.status === 'active') {
        onActive();
      }
    }, 3000);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [subscriptionId, onActive]);
}
