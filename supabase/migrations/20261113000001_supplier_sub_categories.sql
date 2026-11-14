-- Registered suppliers were never linked to the directory taxonomy
-- (categories -> sub_categories), so category pages only listed the imported
-- directory_vendors. This adds the link table, keeps supplier listings filled
-- from sign-up details, and links the existing real suppliers.

CREATE TABLE IF NOT EXISTS public.supplier_sub_categories (
  supplier_id uuid NOT NULL REFERENCES public.supplier_profiles(id) ON DELETE CASCADE,
  sub_category_id uuid NOT NULL REFERENCES public.sub_categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (supplier_id, sub_category_id)
);
CREATE INDEX IF NOT EXISTS supplier_sub_categories_sub_idx ON public.supplier_sub_categories (sub_category_id);

ALTER TABLE public.supplier_sub_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view supplier sub-categories" ON public.supplier_sub_categories;
CREATE POLICY "Anyone can view supplier sub-categories" ON public.supplier_sub_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Suppliers manage own sub-categories" ON public.supplier_sub_categories;
CREATE POLICY "Suppliers manage own sub-categories" ON public.supplier_sub_categories
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.supplier_profiles sp WHERE sp.id = supplier_id AND sp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.supplier_profiles sp WHERE sp.id = supplier_id AND sp.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage supplier sub-categories" ON public.supplier_sub_categories;
CREATE POLICY "Admins manage supplier sub-categories" ON public.supplier_sub_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Sign-up creates the supplier listing as "<Name>'s Business" with nothing
-- else filled in. Copy the real details from the sign-up record, only into
-- empty fields (and over that placeholder name), so edits made later by the
-- supplier or an admin are never overwritten.
CREATE OR REPLACE FUNCTION public.fill_supplier_profile_from_registration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;
  UPDATE public.supplier_profiles sp SET
    company_name = CASE
      WHEN sp.company_name LIKE '%''s Business' AND NULLIF(btrim(NEW.company_name), '') IS NOT NULL
        THEN btrim(NEW.company_name)
      ELSE sp.company_name END,
    city = COALESCE(NULLIF(sp.city, ''), NEW.city),
    state = COALESCE(NULLIF(sp.state, ''), NEW.state),
    address = COALESCE(NULLIF(sp.address, ''), NEW.address),
    phone = COALESCE(NULLIF(sp.phone, ''), NEW.contact_phone, NEW.phone),
    email = COALESCE(NULLIF(sp.email, ''), NEW.email),
    website = COALESCE(NULLIF(sp.website, ''), NEW.website),
    gst_number = COALESCE(NULLIF(sp.gst_number, ''), NEW.gst_number),
    fssai_number = COALESCE(NULLIF(sp.fssai_number, ''), NEW.fssai_number),
    contact_person_name = COALESCE(NULLIF(sp.contact_person_name, ''), NEW.contact_person_name),
    business_description = COALESCE(NULLIF(sp.business_description, ''), NEW.product_description, NEW.menu_description)
  WHERE sp.user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS fill_supplier_profile_on_registration ON public.registration_profiles;
CREATE TRIGGER fill_supplier_profile_on_registration
  AFTER INSERT OR UPDATE ON public.registration_profiles
  FOR EACH ROW EXECUTE FUNCTION public.fill_supplier_profile_from_registration();

-- Backfill existing listings the same way (newest sign-up record per user).
UPDATE public.supplier_profiles sp SET
  company_name = CASE
    WHEN sp.company_name LIKE '%''s Business' AND NULLIF(btrim(rp.company_name), '') IS NOT NULL
      THEN btrim(rp.company_name)
    ELSE sp.company_name END,
  city = COALESCE(NULLIF(sp.city, ''), rp.city),
  state = COALESCE(NULLIF(sp.state, ''), rp.state),
  address = COALESCE(NULLIF(sp.address, ''), rp.address),
  phone = COALESCE(NULLIF(sp.phone, ''), rp.contact_phone, rp.phone),
  email = COALESCE(NULLIF(sp.email, ''), rp.email),
  website = COALESCE(NULLIF(sp.website, ''), rp.website),
  gst_number = COALESCE(NULLIF(sp.gst_number, ''), rp.gst_number),
  fssai_number = COALESCE(NULLIF(sp.fssai_number, ''), rp.fssai_number),
  contact_person_name = COALESCE(NULLIF(sp.contact_person_name, ''), rp.contact_person_name),
  business_description = COALESCE(NULLIF(sp.business_description, ''), rp.product_description, rp.menu_description)
FROM (
  SELECT DISTINCT ON (user_id) * FROM public.registration_profiles
  WHERE user_id IS NOT NULL ORDER BY user_id, created_at DESC
) rp
WHERE rp.user_id = sp.user_id;

-- Link the existing real suppliers to the sub-categories matching what they
-- sell (from their sign-up details and products). Matches by name, so it is a
-- no-op on a database without these rows.
INSERT INTO public.supplier_sub_categories (supplier_id, sub_category_id)
SELECT m.supplier_id::uuid, sc.id
FROM (VALUES
  ('b88bdea9-a436-4c57-8be8-e73e77139f14', 'Food Ingredients & Additives', 'Baking Ingredients'),
  ('b88bdea9-a436-4c57-8be8-e73e77139f14', 'Food Processing & Machinery', 'Bakery & Confectionery Equipment'),
  ('1cd80fe7-8c07-424a-9051-a8b85ab74e82', 'Indian Snacks & Sweets', 'Sweets & Mithai'),
  ('1cd80fe7-8c07-424a-9051-a8b85ab74e82', 'Indian Snacks & Sweets', 'Namkeen & Savouries'),
  ('1b22aade-f195-4013-acfe-fe3381d9e15e', 'Indian Snacks & Sweets', 'Namkeen & Savouries'),
  ('f13910a4-b9cc-40a4-8fac-01207201432a', 'Bakery, Confectionery & Snacks', 'Cakes, Pastries & Muffins'),
  ('f13910a4-b9cc-40a4-8fac-01207201432a', 'Bakery, Confectionery & Snacks', 'Bread, Buns & Rolls'),
  ('d972e1e1-057e-4c4b-b6f2-d7c33399d81e', 'Health, Organic & Specialty', 'Nutraceuticals & Health Supplements'),
  ('d972e1e1-057e-4c4b-b6f2-d7c33399d81e', 'Dairy & Alternatives', 'Cheese – Processed, Artisan & Specialty'),
  ('d972e1e1-057e-4c4b-b6f2-d7c33399d81e', 'Dairy & Alternatives', 'Butter, Ghee & Paneer'),
  ('f571d86f-53c6-4331-ac04-222b31caa438', 'Beverages', 'Carbonated Drinks & Energy Drinks')
) AS m(supplier_id, category_name, sub_name)
JOIN public.categories c ON c.name = m.category_name
JOIN public.sub_categories sc ON sc.category_id = c.id AND sc.name = m.sub_name
JOIN public.supplier_profiles sp ON sp.id = m.supplier_id::uuid
ON CONFLICT DO NOTHING;
