import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { computeSubscriptionMonths } from "../_shared/subscriptionPromo.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-timestamp',
};

const FAILURE_TYPES = new Set(['PAYMENT_FAILED_WEBHOOK', 'PAYMENT_USER_DROPPED_WEBHOOK']);
const FAILURE_STATUSES = new Set(['FAILED', 'USER_DROPPED', 'CANCELLED']);

async function verifySignature(rawBody: string, timestamp: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp + rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));

  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Plain reachability/health-check pings (e.g. Cashfree's dashboard "test
  // endpoint" probe when adding the webhook) should always succeed -- they
  // carry no signature and shouldn't depend on secrets being configured yet.
  if (req.method === 'GET' || req.method === 'HEAD') {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const CASHFREE_WEBHOOK_SECRET = Deno.env.get('CASHFREE_WEBHOOK_SECRET');

    if (!CASHFREE_WEBHOOK_SECRET) {
      console.error('CASHFREE_WEBHOOK_SECRET is not configured');
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');

    if (!signature || !timestamp) {
      return new Response(JSON.stringify({ error: 'Missing signature headers' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const valid = await verifySignature(rawBody, timestamp, signature, CASHFREE_WEBHOOK_SECRET);
    if (!valid) {
      console.error('Cashfree webhook signature verification failed');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.parse(rawBody);
    const eventType: string = payload.type;
    const orderId: string | undefined = payload.data?.order?.order_id;
    const paymentStatus: string | undefined = payload.data?.payment?.payment_status;
    const cfPaymentId: string | undefined = payload.data?.payment?.cf_payment_id;
    const paymentAmount: number | undefined = payload.data?.payment?.payment_amount;

    if (!orderId) {
      console.error('Webhook payload missing order_id:', rawBody);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: row, error: fetchError } = await admin
      .from('user_subscriptions')
      .select('id, status, payment_status, billing_cycle')
      .eq('cf_order_id', orderId)
      .eq('payment_provider', 'cashfree')
      .maybeSingle();

    if (fetchError || !row) {
      console.error('No subscription row found for cf_order_id:', orderId, fetchError);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Idempotency: Cashfree retries webhook delivery until it gets a prompt
    // 2xx, so a repeat delivery for an already-processed row is a no-op.
    if (row.status === 'active' && row.payment_status === 'paid') {
      return new Response(JSON.stringify({ received: true, alreadyProcessed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isSuccess = eventType === 'PAYMENT_SUCCESS_WEBHOOK' && paymentStatus === 'SUCCESS';
    const isFailure = FAILURE_TYPES.has(eventType) || (paymentStatus && FAILURE_STATUSES.has(paymentStatus));

    if (isSuccess) {
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + computeSubscriptionMonths(row.billing_cycle as 'monthly' | 'annual'));

      const { error: updateError } = await admin
        .from('user_subscriptions')
        .update({
          status: 'active',
          payment_status: 'paid',
          payment_reference: cfPaymentId ?? null,
          amount_paid: paymentAmount ?? null,
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          activated_at: new Date().toISOString(),
        })
        .eq('id', row.id)
        .eq('status', 'pending_payment');

      if (updateError) {
        console.error('Failed to activate subscription:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to activate subscription' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (isFailure) {
      await admin
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          admin_notes: `Cashfree payment ${paymentStatus || eventType}`,
        })
        .eq('id', row.id)
        .eq('status', 'pending_payment');
    }
    // Any other event type (e.g. PAYMENT_PENDING) is acknowledged and ignored.

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('cashfree-webhook error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
