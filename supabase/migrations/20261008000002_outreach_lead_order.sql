-- Rows imported in one batch share a created_at, so ordering by it does not
-- preserve the spreadsheet's row order. seq gives leads a stable import
-- order, which "select next 10 unsent" walks through.
ALTER TABLE public.outreach_leads ADD COLUMN seq BIGINT GENERATED ALWAYS AS IDENTITY;
CREATE UNIQUE INDEX idx_outreach_leads_seq ON public.outreach_leads (seq);
