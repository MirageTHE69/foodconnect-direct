
CREATE TYPE public.category_type AS ENUM ('product', 'service');

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'Package',
  type category_type NOT NULL DEFAULT 'product',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  item_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE TABLE public.sub_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sub_categories" ON public.sub_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage sub_categories" ON public.sub_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE TABLE public.hot_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  location text,
  quantity text,
  budget_range text,
  posted_by_admin uuid,
  contact_user_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hot_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hot_requirements" ON public.hot_requirements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage hot_requirements" ON public.hot_requirements
  FOR ALL USING (has_role(auth.uid(), 'admin'));
