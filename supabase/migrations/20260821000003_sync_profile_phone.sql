-- registration_profiles.phone/contact_phone was collected at signup but
-- never copied into public.profiles.phone -- the only place downstream code
-- (create-payment-order, for Cashfree's required customer_phone) actually
-- reads a phone number from. A prior migration did a one-off backfill of
-- supplier_profiles.phone from this same source, but that was a point-in-
-- time UPDATE, not an ongoing sync, and it targeted the wrong table for this
-- purpose. This adds a real trigger and backfills existing rows.

CREATE OR REPLACE FUNCTION public.sync_registration_profile_phone()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET phone = COALESCE(NEW.contact_phone, NEW.phone, phone)
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS sync_profile_phone_on_registration ON public.registration_profiles;
CREATE TRIGGER sync_profile_phone_on_registration
  AFTER INSERT OR UPDATE ON public.registration_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_registration_profile_phone();

-- Backfill: every existing user's profiles.phone was NULL from this gap.
UPDATE public.profiles p
SET phone = COALESCE(rp.contact_phone, rp.phone)
FROM public.registration_profiles rp
WHERE rp.user_id = p.user_id
  AND p.phone IS NULL
  AND COALESCE(rp.contact_phone, rp.phone) IS NOT NULL;
