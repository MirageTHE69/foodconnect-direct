-- GST invoicing support: state-based CGST/SGST vs IGST split on subscription
-- purchases, plus sequential tax-invoice numbering.
--
-- FoodAdda's subscription prices are already GST-inclusive (see
-- subscription_plans.gst_percent, default 18). When a buyer is billed, we
-- back-calculate the taxable value from the inclusive price and split the
-- GST into CGST+SGST (buyer in Gujarat, since FoodAdda is Gujarat-registered)
-- or a single IGST line (buyer outside Gujarat). Both cases total the same
-- gst_percent of the taxable value -- only the invoice presentation differs.

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS billing_state TEXT,
  ADD COLUMN IF NOT EXISTS taxable_value NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS igst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 18,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_invoice_number
  ON public.user_subscriptions (invoice_number)
  WHERE invoice_number IS NOT NULL;

-- Sequential, gap-tolerant invoice numbering (gaps from rolled-back
-- transactions are acceptable and standard for DB sequences; GST law
-- requires sequential numbering of *issued* invoices, not a dense series).
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq_val BIGINT;
  fy_start INT;
BEGIN
  seq_val := nextval('public.invoice_number_seq');
  IF EXTRACT(MONTH FROM now()) >= 4 THEN
    fy_start := EXTRACT(YEAR FROM now())::INT;
  ELSE
    fy_start := EXTRACT(YEAR FROM now())::INT - 1;
  END IF;
  RETURN 'FA/' || fy_start || '-' || to_char((fy_start + 1) % 100, 'FM00') || '/' || lpad(seq_val::text, 5, '0');
END;
$$;
