import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { calculateGst, INDIAN_STATES } from "../_shared/gst.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      return json({ error: 'Payment gateway not configured' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing authorization' }, 401);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: 'Invalid session' }, 401);
    }
    const user = userData.user;

    const { plan_id, billing_cycle, billing_state } = await req.json();
    if (!plan_id || (billing_cycle !== 'monthly' && billing_cycle !== 'annual')) {
      return json({ error: 'plan_id and a valid billing_cycle are required' }, 400);
    }
    if (!billing_state || !INDIAN_STATES.includes(billing_state)) {
      return json({ error: 'A valid billing_state is required' }, 400);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: plan, error: planError } = await admin
      .from('subscription_plans')
      .select('id, code, price_monthly, price_annual, gst_percent, is_active')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return json({ error: 'Plan not found' }, 404);
    }

    const amount = billing_cycle === 'annual' ? plan.price_annual : plan.price_monthly;
    if (!amount || amount <= 0) {
      return json({ error: 'This plan does not require payment' }, 400);
    }

    const gst = calculateGst(amount, plan.gst_percent ?? 18, billing_state);

    const { data: subRow, error: insertError } = await admin
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        billing_cycle,
        payment_provider: 'razorpay',
        billing_state,
        taxable_value: gst.taxableValue,
        cgst_amount: gst.cgstAmount,
        sgst_amount: gst.sgstAmount,
        igst_amount: gst.igstAmount,
        gst_rate: plan.gst_percent ?? 18,
      })
      .select('id')
      .single();

    if (insertError || !subRow) {
      console.error('Failed to create pending subscription row:', insertError);
      return json({ error: 'Failed to start subscription' }, 500);
    }

    const receipt = `sub_${subRow.id}`;
    const authToken = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    const rpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency: 'INR',
        receipt,
        notes: {
          subscription_id: subRow.id,
          plan_code: plan.code,
          billing_cycle,
        },
      }),
    });

    if (!rpResponse.ok) {
      const errorText = await rpResponse.text();
      console.error('Razorpay order creation failed:', rpResponse.status, errorText);
      // Clean up the pending row so the user isn't stuck behind a dead order.
      await admin.from('user_subscriptions').delete().eq('id', subRow.id);
      return json({ error: 'Failed to create payment order' }, 502);
    }

    const rpOrder = await rpResponse.json();

    await admin
      .from('user_subscriptions')
      .update({ gateway_order_id: rpOrder.id })
      .eq('id', subRow.id);

    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', user.id)
      .maybeSingle();

    return json({
      order_id: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      key_id: RAZORPAY_KEY_ID,
      subscription_id: subRow.id,
      prefill: {
        name: profile?.full_name ?? undefined,
        email: user.email ?? undefined,
        contact: profile?.phone ?? undefined,
      },
    });
  } catch (error) {
    console.error('create-payment-order error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
