-- Two RLS gaps found while testing the new resume/recipe admin features:
--
-- 1. Uploads to the "resumes" storage bucket were failing RLS for ANYONE
--    (anon and authenticated), including the pre-existing job-application
--    "Apply Now" flow -- the live policy had drifted from what the original
--    migration defined. Recreated explicitly so both job applications and
--    the new general talent-pool submissions can upload.
-- 2. recipe_ingredients had no policy allowing admins to manage rows for
--    admin-authored recipes (only "Suppliers can manage own" existed),
--    so publishing an official recipe with ingredients failed.

DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
CREATE POLICY "Anyone can upload resumes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Anyone can view resumes" ON storage.objects;
CREATE POLICY "Anyone can view resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY "Admins can manage all recipe ingredients" ON public.recipe_ingredients
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
