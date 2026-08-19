-- Lets a logged-in user post their own sourcing requirement (landing page
-- "Post Requirement" button). New rows land inactive so they go through the
-- same admin review the existing AdminHotRequirements page already supports
-- (it lists inactive rows dimmed with Edit/Activate/Delete).

CREATE POLICY "Users can create own requirements" ON public.hot_requirements
  FOR INSERT WITH CHECK (
    auth.uid() = contact_user_id AND posted_by_admin IS NULL AND is_active = false
  );
