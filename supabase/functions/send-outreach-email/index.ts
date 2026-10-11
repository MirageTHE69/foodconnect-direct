import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MAX_BATCH = 10;
const MAX_SUBJECT_CHARS = 200;
const MAX_BODY_CHARS = 10000;
// Resend's default rate limit is 2 requests/second.
const SEND_SPACING_MS = 600;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fillPlaceholders(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => (key in values ? values[key] : match));
}

/** Start of the current day in India (IST, UTC+5:30), as a UTC ISO string. */
function startOfIndiaDay(): string {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS).toISOString();
}

function buildHtml(bodyHtml: string, unsubscribeUrl: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f4ec;">
    <div style="max-width:600px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;">
      <div style="background:#ffffff;border-radius:8px;padding:28px 24px;">
        <div style="font-size:22px;font-weight:bold;color:#1a1a1a;margin-bottom:20px;">Food<span style="color:#d9a400;">Adda</span></div>
        <div style="font-size:15px;line-height:1.6;color:#333333;">${bodyHtml}</div>
      </div>
      <div style="font-size:12px;line-height:1.5;color:#8a8577;text-align:center;padding:16px 8px;">
        FoodAdda, 337, 3rd Floor, Infinity Arcade, Pratap Nagar Bridge, Pratap Nagar, Vadodara - 390004, Gujarat<br>
        You received this email because your business is listed as a food industry contact.<br>
        <a href="${unsubscribeUrl}" style="color:#8a8577;">Unsubscribe</a>
      </div>
    </div>
  </body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const FROM = Deno.env.get('OUTREACH_FROM') || 'FoodAdda <info@foodadda.in>';
    const REPLY_TO = Deno.env.get('OUTREACH_REPLY_TO') || 'info@foodadda.in';
    const SITE_URL = (Deno.env.get('SITE_URL') || 'https://foodadda.in').replace(/\/$/, '');
    const dailyLimit = Number(Deno.env.get('OUTREACH_DAILY_LIMIT')) || 100;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization' }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: 'Invalid session' }, 401);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: adminRole } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!adminRole) return json({ error: 'Admins only' }, 403);

    const { count: sentTodayCount } = await admin
      .from('outreach_email_logs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('created_at', startOfIndiaDay());
    const sentToday = sentTodayCount ?? 0;

    const payload = await req.json().catch(() => ({}));

    if (payload.action === 'status') {
      return json({ configured: !!RESEND_API_KEY, sent_today: sentToday, daily_limit: dailyLimit, from: FROM });
    }

    const subject = typeof payload.subject === 'string' ? payload.subject.trim() : '';
    const body = typeof payload.body === 'string' ? payload.body.trim() : '';
    const leadIds: string[] = Array.isArray(payload.lead_ids)
      ? [...new Set((payload.lead_ids as unknown[]).filter((id): id is string => typeof id === 'string' && UUID_RE.test(id)))]
      : [];

    if (!subject || !body) return json({ error: 'Subject and message are required.' }, 400);
    if (subject.length > MAX_SUBJECT_CHARS || body.length > MAX_BODY_CHARS) {
      return json({ error: 'Subject or message is too long.' }, 400);
    }
    if (leadIds.length === 0) return json({ error: 'Select at least one lead.' }, 400);
    if (leadIds.length > MAX_BATCH) return json({ error: `You can email at most ${MAX_BATCH} leads at a time.` }, 400);

    if (!RESEND_API_KEY) {
      return json({ error: 'Email sending is not set up yet. The Resend API key is missing.' }, 500);
    }

    const { data: leads, error: leadsError } = await admin
      .from('outreach_leads')
      .select('id, name, email, business_type, company, city, unsubscribed, unsubscribe_token, email_count')
      .in('id', leadIds);
    if (leadsError) throw leadsError;

    const sendable = (leads ?? []).filter((l) => l.email && !l.unsubscribed);
    const remaining = dailyLimit - sentToday;
    if (sendable.length > remaining) {
      return json({
        error: remaining <= 0
          ? `Today's limit of ${dailyLimit} emails is used up. Try again tomorrow.`
          : `Only ${remaining} emails are left in today's limit of ${dailyLimit}. Select fewer leads.`,
      }, 429);
    }

    const results: { lead_id: string; name: string; email: string | null; status: 'sent' | 'failed' | 'skipped'; error?: string }[] = [];

    for (const lead of leads ?? []) {
      if (!lead.email) {
        results.push({ lead_id: lead.id, name: lead.name, email: null, status: 'skipped', error: 'No email address' });
        continue;
      }
      if (lead.unsubscribed) {
        results.push({ lead_id: lead.id, name: lead.name, email: lead.email, status: 'skipped', error: 'Unsubscribed' });
        continue;
      }

      const values = {
        name: lead.name ?? '',
        business_type: lead.business_type ?? '',
        company: lead.company ?? lead.name ?? '',
        city: lead.city ?? '',
      };
      const escapedValues = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, escapeHtml(v)]));
      const personalSubject = fillPlaceholders(subject, values).replace(/[\r\n]+/g, ' ').slice(0, MAX_SUBJECT_CHARS);
      const textBody = fillPlaceholders(body, values);
      const htmlBody = fillPlaceholders(escapeHtml(body), escapedValues)
        .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" style="color:#b8860b;">$1</a>')
        .replace(/\r?\n/g, '<br>');
      const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${lead.unsubscribe_token}`;

      let status: 'sent' | 'failed' = 'failed';
      let providerId: string | null = null;
      let errorMessage: string | null = null;

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: FROM,
            to: [lead.email],
            reply_to: REPLY_TO,
            subject: personalSubject,
            html: buildHtml(htmlBody, unsubscribeUrl),
            text: `${textBody}\n\n--\nFoodAdda, Vadodara, Gujarat\nUnsubscribe: ${unsubscribeUrl}`,
            headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          status = 'sent';
          providerId = data.id ?? null;
        } else {
          errorMessage = String(data.message || data.error || `Email service error (${res.status})`).slice(0, 300);
        }
      } catch (e) {
        errorMessage = e instanceof Error ? e.message.slice(0, 300) : 'Network error';
      }

      await admin.from('outreach_email_logs').insert({
        lead_id: lead.id,
        to_email: lead.email,
        subject: personalSubject,
        status,
        provider_message_id: providerId,
        error: errorMessage,
        sent_by: userData.user.id,
      });

      await admin
        .from('outreach_leads')
        .update(
          status === 'sent'
            ? { email_status: 'sent', email_count: (lead.email_count ?? 0) + 1, last_emailed_at: new Date().toISOString() }
            : { email_status: 'failed' },
        )
        .eq('id', lead.id);

      results.push({ lead_id: lead.id, name: lead.name, email: lead.email, status, ...(errorMessage ? { error: errorMessage } : {}) });
      await new Promise((resolve) => setTimeout(resolve, SEND_SPACING_MS));
    }

    const sentNow = results.filter((r) => r.status === 'sent').length;
    return json({ results, sent_today: sentToday + sentNow, daily_limit: dailyLimit });
  } catch (error) {
    console.error('send-outreach-email error:', error);
    return json({ error: 'Something went wrong while sending. Please try again.' }, 500);
  }
});
