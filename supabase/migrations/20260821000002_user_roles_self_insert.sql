-- Signup was silently failing for every new user with "new row violates
-- row-level security policy for table user_roles" -- the INSERT policy that
-- lets a freshly-signed-up user assign themselves a role never made it onto
-- this project (it exists in the original schema history but not on the
-- live restored database). Re-adding it here, narrowed to buyer/supplier
-- only (not admin) so a crafted direct API call can't self-grant admin --
-- the signup UI only ever submits 'buyer' or 'supplier' anyway.
DROP POLICY IF EXISTS "Users can insert own role during signup" ON public.user_roles;

CREATE POLICY "Users can insert own role during signup" ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role IN ('buyer', 'supplier'));
