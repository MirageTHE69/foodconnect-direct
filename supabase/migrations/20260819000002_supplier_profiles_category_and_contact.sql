-- Adds the Business Category (drives category-credit plan pricing) and the
-- contact/capability fields needed for the spec's per-field gating table.
-- These fields aren't displayed anywhere in the app today; contact is
-- currently mediated only through enquiries/chat. Backfills from the
-- orphaned registration_profiles intake data where a matching user exists.

ALTER TABLE public.supplier_profiles
  ADD COLUMN business_category public.business_category,
  ADD COLUMN contact_person_name TEXT,
  ADD COLUMN phone TEXT,
  ADD COLUMN email TEXT,
  ADD COLUMN moq TEXT,
  ADD COLUMN export_capability TEXT,
  ADD COLUMN manufacturing_capability TEXT;

UPDATE public.supplier_profiles sp
SET
  contact_person_name = rp.contact_person_name,
  phone = COALESCE(rp.contact_phone, rp.phone),
  email = rp.email,
  moq = rp.moq,
  export_capability = rp.export_capability
FROM public.registration_profiles rp
WHERE rp.user_id = sp.user_id;
