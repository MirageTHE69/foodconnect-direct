import { supabase } from '@/integrations/supabase/client';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let razorpayScriptPromise: Promise<void> | null = null;

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

interface CheckoutResult {
  result: { error?: { message: string } };
  subscriptionId: string;
}

/**
 * Creates a Razorpay order via the create-payment-order edge function, then
 * opens Razorpay's embedded Checkout modal so the user never leaves the
 * site. The client-side handler only reflects that checkout completed --
 * real activation happens asynchronously via razorpay-webhook. Callers must
 * watch the returned subscriptionId (see useSubscriptionActivationWatcher).
 */
export async function startRazorpayCheckout(planId: string, billingCycle: 'monthly' | 'annual'): Promise<CheckoutResult> {
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

  const { order_id, amount, currency, key_id, subscription_id, prefill } = data;

  await loadRazorpayScript();

  return new Promise<CheckoutResult>((resolve) => {
    const rzp = new window.Razorpay!({
      key: key_id,
      amount,
      currency,
      order_id,
      name: 'FoodAdda',
      description: 'Subscription payment',
      prefill,
      theme: { color: '#f0c419' },
      handler: () => {
        resolve({ result: {}, subscriptionId: subscription_id });
      },
      modal: {
        ondismiss: () => {
          resolve({ result: { error: { message: 'Payment was not completed.' } }, subscriptionId: subscription_id });
        },
      },
    });
    rzp.on('payment.failed', (response: unknown) => {
      const message = (response as { error?: { description?: string } })?.error?.description || 'Payment failed.';
      resolve({ result: { error: { message } }, subscriptionId: subscription_id });
    });
    rzp.open();
  });
}
