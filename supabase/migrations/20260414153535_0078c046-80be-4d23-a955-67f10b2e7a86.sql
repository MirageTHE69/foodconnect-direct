
CREATE TABLE public.directory_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_category_id UUID NOT NULL REFERENCES public.sub_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.directory_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vendors" ON public.directory_vendors
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage vendors" ON public.directory_vendors
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
