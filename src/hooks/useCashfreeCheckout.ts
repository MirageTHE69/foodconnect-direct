import { load, type Cashfree } from '@cashfreepayments/cashfree-js';
import { supabase } from '@/integrations/supabase/client';

let cashfreePromise: Promise<Cashfree> | null = null;

function getCashfree() {
  if (!cashfreePromise) {
    const mode = import.meta.env.VITE_CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
    cashfreePromise = load({ mode });
  }
  return cashfreePromise;
}

/**
 * Creates a Cashfree order via the create-payment-order edge function, then
 * opens the Drop-in checkout embedded on-page (modal) so the user never
 * leaves the site. Real activation happens asynchronously via the
 * cashfree-webhook edge function -- callers must watch the returned
 * subscriptionId (see useSubscriptionActivationWatcher) rather than assume
 * activation on checkout resolution.
 */
export async function startCashfreeCheckout(planId: string, billingCycle: 'monthly' | 'annual') {
  const { data, error } = await supabase.functions.invoke('create-payment-order', {
    body: { plan_id: planId, billing_cycle: billingCycle },
  });

  if (error) {
    // supabase-js's FunctionsHttpError only carries a generic message --
    // the actual reason is in the raw Response body on error.context.
    const context = (error as { context?: Response }).context;
    let specificMessage: string | null = null;
    if (context) {
      try {
        const body = await context.clone().json();
        if (body?.error) specificMessage = body.error;
      } catch {
        // response body wasn't JSON -- fall through to the generic error
      }
    }
    throw specificMessage ? new Error(specificMessage) : error;
  }
  if (data?.error) throw new Error(data.error);

  const { payment_session_id, subscription_id } = data;
  const cashfree = await getCashfree();

  const result = await cashfree.checkout({
    paymentSessionId: payment_session_id,
    redirectTarget: '_modal',
  });

  return { result, subscriptionId: subscription_id as string };
}
