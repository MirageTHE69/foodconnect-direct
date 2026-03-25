ALTER TABLE public.registration_profiles
  ADD COLUMN IF NOT EXISTS b2b_category text,
  ADD COLUMN IF NOT EXISTS private_label text,
  ADD COLUMN IF NOT EXISTS export_capability text,
  ADD COLUMN IF NOT EXISTS logistics_support text,
  ADD COLUMN IF NOT EXISTS pricing_tier text,
  ADD COLUMN IF NOT EXISTS certifications_text text;