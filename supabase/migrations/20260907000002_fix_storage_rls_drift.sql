-- Sitewide bug found while testing the recipe-PDF upload feature: uploads
-- to every storage bucket except "resumes" (already fixed in
-- 20260906000003) were being rejected by row-level security --
-- confirmed via direct authenticated-upload tests against avatars,
-- suppliers, products, recipes, and registration_files. The live
-- policies had drifted from what their original migrations defined (most
-- likely from a dashboard-side change outside the tracked migration
-- history), silently breaking: profile picture uploads, supplier
-- image uploads, product photo uploads, recipe image/PDF uploads, and
-- signup document uploads (FSSAI certs etc.) for every user on the
-- live site.
--
-- Recreates each policy exactly as originally defined so this is a pure
-- restoration, not a policy change.

-- avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- suppliers
DROP POLICY IF EXISTS "Supplier images are publicly accessible" ON storage.objects;
CREATE POLICY "Supplier images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'suppliers');
DROP POLICY IF EXISTS "Suppliers can upload their own images" ON storage.objects;
CREATE POLICY "Suppliers can upload their own images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'suppliers' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Suppliers can update their own images" ON storage.objects;
CREATE POLICY "Suppliers can update their own images" ON storage.objects FOR UPDATE USING (bucket_id = 'suppliers' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Suppliers can delete their own images" ON storage.objects;
CREATE POLICY "Suppliers can delete their own images" ON storage.objects FOR DELETE USING (bucket_id = 'suppliers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- products
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
CREATE POLICY "Product images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'products');
DROP POLICY IF EXISTS "Suppliers can upload product images" ON storage.objects;
CREATE POLICY "Suppliers can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Suppliers can update product images" ON storage.objects;
CREATE POLICY "Suppliers can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Suppliers can delete product images" ON storage.objects;
CREATE POLICY "Suppliers can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

-- recipes (images + the new PDF e-book uploads both use this bucket)
DROP POLICY IF EXISTS "Recipe images are publicly accessible" ON storage.objects;
CREATE POLICY "Recipe images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'recipes');
DROP POLICY IF EXISTS "Suppliers can upload recipe images" ON storage.objects;
CREATE POLICY "Suppliers can upload recipe images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recipes' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Suppliers can update recipe images" ON storage.objects;
CREATE POLICY "Suppliers can update recipe images" ON storage.objects FOR UPDATE USING (bucket_id = 'recipes' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Suppliers can delete recipe images" ON storage.objects;
CREATE POLICY "Suppliers can delete recipe images" ON storage.objects FOR DELETE USING (bucket_id = 'recipes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- registration_files
DROP POLICY IF EXISTS "Users can upload registration files" ON storage.objects;
CREATE POLICY "Users can upload registration files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'registration_files' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Public can view registration files" ON storage.objects;
CREATE POLICY "Public can view registration files" ON storage.objects FOR SELECT USING (bucket_id = 'registration_files');
DROP POLICY IF EXISTS "Users can delete own registration files" ON storage.objects;
CREATE POLICY "Users can delete own registration files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'registration_files' AND (storage.foldername(name))[1] = auth.uid()::text);
