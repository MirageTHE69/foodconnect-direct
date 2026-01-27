-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('suppliers', 'suppliers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('recipes', 'recipes', true);

-- RLS Policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS Policies for suppliers bucket
CREATE POLICY "Supplier images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'suppliers');

CREATE POLICY "Suppliers can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'suppliers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Suppliers can update their own images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'suppliers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Suppliers can delete their own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'suppliers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS Policies for products bucket
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Suppliers can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Suppliers can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Suppliers can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS Policies for recipes bucket
CREATE POLICY "Recipe images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipes');

CREATE POLICY "Suppliers can upload recipe images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'recipes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Suppliers can update recipe images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'recipes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Suppliers can delete recipe images"
ON storage.objects FOR DELETE
USING (bucket_id = 'recipes' AND auth.uid()::text = (storage.foldername(name))[1]);