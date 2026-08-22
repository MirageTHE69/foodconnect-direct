import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID');
    const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY');
    const CASHFREE_ENV = Deno.env.get('CASHFREE_ENV') || 'sandbox';
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://foodadda.in';

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      console.error('Cashfree credentials not configured');
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

    const { plan_id, billing_cycle } = await req.json();
    if (!plan_id || (billing_cycle !== 'monthly' && billing_cycle !== 'annual')) {
      return json({ error: 'plan_id and a valid billing_cycle are required' }, 400);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: plan, error: planError } = await admin
      .from('subscription_plans')
      .select('id, code, price_monthly, price_annual, is_active')
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

    const { data: profile } = await admin
      .from('profiles')
      .select('phone, full_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile?.phone) {
      return json({ error: 'Add a phone number to your profile before subscribing' }, 400);
    }

    const { data: subRow, error: insertError } = await admin
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        billing_cycle,
        payment_provider: 'cashfree',
      })
      .select('id')
      .single();

    if (insertError || !subRow) {
      console.error('Failed to create pending subscription row:', insertError);
      return json({ error: 'Failed to start subscription' }, 500);
    }

    const orderId = `sub_${subRow.id}`;
    const cashfreeHost = CASHFREE_ENV === 'production' ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com';

    const cfResponse = await fetch(`${cashfreeHost}/pg/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: user.id,
          customer_email: user.email,
          customer_phone: profile.phone,
        },
        order_meta: {
          notify_url: `${SUPABASE_URL}/functions/v1/cashfree-webhook`,
          return_url: `${SITE_URL}/dashboard?subscription=processing&order_id={order_id}`,
        },
        order_note: `FoodAdda subscription ${plan.code} (${billing_cycle})`,
      }),
    });

    if (!cfResponse.ok) {
      const errorText = await cfResponse.text();
      console.error('Cashfree order creation failed:', cfResponse.status, errorText);
      // Clean up the pending row so the user isn't stuck behind a dead order.
      await admin.from('user_subscriptions').delete().eq('id', subRow.id);
      return json({ error: 'Failed to create payment order' }, 502);
    }

    const cfOrder = await cfResponse.json();

    await admin
      .from('user_subscriptions')
      .update({ cf_order_id: orderId })
      .eq('id', subRow.id);

    return json({
      payment_session_id: cfOrder.payment_session_id,
      order_id: orderId,
      subscription_id: subRow.id,
    });
  } catch (error) {
    console.error('create-payment-order error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
