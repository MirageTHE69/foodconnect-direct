-- Aadhaar number collected at sign-up. registration_profiles is readable only
-- by the owner and admins (existing RLS), so no new policy is needed.
ALTER TABLE public.registration_profiles ADD COLUMN IF NOT EXISTS aadhar_number text;
