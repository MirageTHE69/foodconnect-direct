
-- Add reputation/specialty columns to supplier_profiles
ALTER TABLE public.supplier_profiles
  ADD COLUMN IF NOT EXISTS specialty text,
  ADD COLUMN IF NOT EXISTS specialty_tags text[],
  ADD COLUMN IF NOT EXISTS market_reputation text DEFAULT 'emerging',
  ADD COLUMN IF NOT EXISTS reputation_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS years_in_business integer;

-- Add check constraint for market_reputation values
ALTER TABLE public.supplier_profiles
  ADD CONSTRAINT check_market_reputation
  CHECK (market_reputation IN ('premium', 'established', 'emerging'));

-- Add check constraint for reputation_score range
ALTER TABLE public.supplier_profiles
  ADD CONSTRAINT check_reputation_score
  CHECK (reputation_score >= 0 AND reputation_score <= 100);

-- Index for featured suppliers query (landing page)
CREATE INDEX IF NOT EXISTS idx_supplier_featured_reputation
  ON public.supplier_profiles (is_featured, reputation_score DESC)
  WHERE is_featured = true;

-- Index for specialty search
CREATE INDEX IF NOT EXISTS idx_supplier_specialty_tags
  ON public.supplier_profiles USING GIN (specialty_tags);
