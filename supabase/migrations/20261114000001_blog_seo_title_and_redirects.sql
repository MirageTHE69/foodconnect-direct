-- Optional short title for search results / browser tab (the page still shows
-- the full article title), and old slugs that should redirect to this post
-- when an article is republished under a new URL.
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS previous_slugs text[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS blogs_previous_slugs_idx ON public.blogs USING gin (previous_slugs);
