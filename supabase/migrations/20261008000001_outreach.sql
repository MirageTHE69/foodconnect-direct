-- Admin outreach: imported leads, reusable email templates, and a send log.
-- All three tables are admin-only. Emails are sent by the
-- send-outreach-email edge function (service role), never from the client.

CREATE TABLE public.outreach_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  -- Stored lowercased; UNIQUE (NULLs allowed) lets imports upsert-and-skip duplicates.
  email TEXT UNIQUE CHECK (email = lower(email)),
  phone TEXT,
  business_type TEXT,
  company TEXT,
  city TEXT,
  source TEXT,
  email_status TEXT NOT NULL DEFAULT 'not_sent' CHECK (email_status IN ('not_sent', 'sent', 'failed')),
  email_count INTEGER NOT NULL DEFAULT 0,
  last_emailed_at TIMESTAMPTZ,
  last_whatsapp_at TIMESTAMPTZ,
  unsubscribed BOOLEAN NOT NULL DEFAULT false,
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_outreach_leads_status ON public.outreach_leads (email_status, created_at);
CREATE INDEX idx_outreach_leads_business_type ON public.outreach_leads (business_type);

CREATE TABLE public.outreach_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.outreach_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.outreach_leads(id) ON DELETE SET NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  provider_message_id TEXT,
  error TEXT,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_outreach_email_logs_created ON public.outreach_email_logs (created_at);

ALTER TABLE public.outreach_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage outreach leads" ON public.outreach_leads
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage outreach templates" ON public.outreach_email_templates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins view outreach logs" ON public.outreach_email_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.outreach_email_templates (name, subject, body) VALUES (
  'FoodAdda introduction',
  'Grow your food business with FoodAdda, {{name}}',
  E'Hello {{name}},\n\nI''m reaching out from FoodAdda (foodadda.in), India''s first B2B marketplace built exclusively for the food industry.\n\nWe connect food suppliers, manufacturers, distributors and buyers directly, with no middlemen and no commissions. Businesses like yours use FoodAdda to showcase products, receive enquiries and find new buyers across India.\n\nYou can create your profile here: https://foodadda.in\n\nIf you have any questions, just reply to this email and we''ll be happy to help.\n\nWarm regards,\nTeam FoodAdda\n+91 93281 37674'
);
