import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { computeSubscriptionMonths } from "../_shared/subscriptionPromo.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function verifySignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const expected = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, '0')).join('');

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

  // Plain reachability pings (e.g. a dashboard "test endpoint" check) should
  // always succeed -- they carry no signature and shouldn't depend on
  // secrets being configured yet.
  if (req.method === 'GET' || req.method === 'HEAD') {
    return jsonResponse({ ok: true });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return jsonResponse({ error: 'Webhook not configured' }, 500);
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return jsonResponse({ error: 'Missing signature header' }, 401);
    }

    const valid = await verifySignature(rawBody, signature, RAZORPAY_WEBHOOK_SECRET);
    if (!valid) {
      console.error('Razorpay webhook signature verification failed');
      return jsonResponse({ error: 'Invalid signature' }, 401);
    }

    const payload = JSON.parse(rawBody);
    const eventType: string = payload.event;
    const payment = payload.payload?.payment?.entity;

    if (!payment?.order_id) {
      console.error('Webhook payload missing payment.order_id:', rawBody);
      return jsonResponse({ received: true });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: row, error: fetchError } = await admin
      .from('user_subscriptions')
      .select('id, status, payment_status, billing_cycle')
      .eq('gateway_order_id', payment.order_id)
      .eq('payment_provider', 'razorpay')
      .maybeSingle();

    if (fetchError || !row) {
      console.error('No subscription row found for gateway_order_id:', payment.order_id, fetchError);
      return jsonResponse({ received: true });
    }

    // Idempotency: Razorpay retries webhook delivery until it gets a prompt
    // 2xx, so a repeat delivery for an already-processed row is a no-op.
    if (row.status === 'active' && row.payment_status === 'paid') {
      return jsonResponse({ received: true, alreadyProcessed: true });
    }

    if (eventType === 'payment.captured') {
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + computeSubscriptionMonths(row.billing_cycle as 'monthly' | 'annual'));

      const { error: updateError } = await admin
        .from('user_subscriptions')
        .update({
          status: 'active',
          payment_status: 'paid',
          payment_reference: payment.id ?? null,
          amount_paid: typeof payment.amount === 'number' ? payment.amount / 100 : null,
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          activated_at: new Date().toISOString(),
        })
        .eq('id', row.id)
        .eq('status', 'pending_payment');

      if (updateError) {
        console.error('Failed to activate subscription:', updateError);
        return jsonResponse({ error: 'Failed to activate subscription' }, 500);
      }
    } else if (eventType === 'payment.failed') {
      await admin
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          admin_notes: `Razorpay payment failed: ${payment.error_description ?? 'unknown reason'}`,
        })
        .eq('id', row.id)
        .eq('status', 'pending_payment');
    }
    // Any other event type is acknowledged and ignored.

    return jsonResponse({ received: true });
  } catch (error) {
    console.error('razorpay-webhook error:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
