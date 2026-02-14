-- Drop existing insert policy that requires supplier role
DROP POLICY IF EXISTS "Suppliers can insert own profile" ON public.supplier_profiles;

-- Allow any authenticated user to insert their own supplier profile (for posting products)
CREATE POLICY "Users can insert own supplier profile"
ON public.supplier_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);
