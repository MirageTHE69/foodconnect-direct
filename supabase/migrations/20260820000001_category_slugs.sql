-- Adds human-readable slugs for categories/sub-categories so URLs show a
-- name instead of a raw UUID. Backfill happens in a follow-up script (needs
-- de-duplication logic simpler to do in JS than in SQL); this migration just
-- adds the nullable column + the constraints it will hold once backfilled.

ALTER TABLE public.categories ADD COLUMN slug TEXT;
ALTER TABLE public.sub_categories ADD COLUMN slug TEXT;

-- Unique per table scope: categories globally, sub_categories per parent
-- category (two different categories may reasonably have a sub-category
-- with the same name/slug).
CREATE UNIQUE INDEX categories_slug_key ON public.categories (slug);
CREATE UNIQUE INDEX sub_categories_category_id_slug_key ON public.sub_categories (category_id, slug);
