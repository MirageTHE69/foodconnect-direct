-- Free-form recipe category (e.g. "Dal & Curries", "Sweets") entered by the
-- admin on upload; the public Recipes page builds its filter from the
-- distinct values in use.
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS category TEXT;
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes (category);
