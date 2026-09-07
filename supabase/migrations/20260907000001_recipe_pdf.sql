-- Recipes can optionally be sourced from a pre-designed PDF e-book
-- (uploaded via the admin recipe form) instead of structured fields.
-- When present, the detail page renders the PDF as a flipbook instead
-- of the structured layout.
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS pdf_url TEXT;
