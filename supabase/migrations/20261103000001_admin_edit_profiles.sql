-- Admins edit users' account details from the admin Users page.
-- registration_profiles and supplier_profiles already have admin FOR ALL policies.
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
