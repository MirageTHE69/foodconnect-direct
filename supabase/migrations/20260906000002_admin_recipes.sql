-- Allows admin-authored recipes with no attached supplier. Existing RLS
-- ("Anyone can view approved recipes", "Admins can manage all recipes")
-- already covers a NULL supplier_id correctly -- no policy changes needed.
ALTER TABLE public.recipes ALTER COLUMN supplier_id DROP NOT NULL;
