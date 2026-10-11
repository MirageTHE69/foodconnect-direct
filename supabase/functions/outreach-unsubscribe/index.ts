import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Public: the token in the emailed link is the only credential. Always
// answers ok for a well-formed token so it can't be used to probe for leads.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token } = await req.json().catch(() => ({}));
    if (typeof token !== 'string' || !UUID_RE.test(token)) {
      return json({ error: 'This unsubscribe link is not valid.' }, 400);
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { error } = await admin.from('outreach_leads').update({ unsubscribed: true }).eq('unsubscribe_token', token);
    if (error) throw error;

    return json({ ok: true });
  } catch (error) {
    console.error('outreach-unsubscribe error:', error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
