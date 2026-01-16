-- =============================================
-- FoodAdda Platform Database Schema
-- =============================================

-- 1. Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('buyer', 'supplier', 'admin');

-- 2. Create enum for product status
CREATE TYPE public.product_status AS ENUM ('pending', 'approved', 'rejected');

-- 3. Create enum for supplier verification status
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');

-- =============================================
-- PROFILES TABLE - Basic user profile info
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USER ROLES TABLE - Separate table for roles (security best practice)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTION - Check user role without recursion
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =============================================
-- PRODUCT CATEGORIES TABLE
-- =============================================
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SUPPLIER PROFILES TABLE
-- =============================================
CREATE TABLE public.supplier_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  business_description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  certifications TEXT[],
  fssai_number TEXT,
  gst_number TEXT,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.supplier_profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  images TEXT[],
  specifications JSONB,
  tags TEXT[],
  status product_status NOT NULL DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RECIPES TABLE
-- =============================================
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.supplier_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  images TEXT[],
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  difficulty TEXT,
  tags TEXT[],
  status product_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RECIPE INGREDIENTS TABLE
-- =============================================
CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ingredient_name TEXT NOT NULL,
  quantity TEXT,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SAVED SUPPLIERS TABLE (Buyer favorites)
-- =============================================
CREATE TABLE public.saved_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES public.supplier_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, supplier_id)
);

ALTER TABLE public.saved_suppliers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SAVED PRODUCTS TABLE (Buyer favorites)
-- =============================================
CREATE TABLE public.saved_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ENQUIRIES TABLE
-- =============================================
CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES public.supplier_profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CONVERSATIONS TABLE
-- =============================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES public.supplier_profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (buyer_id, supplier_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- =============================================
-- RLS POLICIES
-- =============================================

-- PROFILES POLICIES
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- USER ROLES POLICIES
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own role during signup" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PRODUCT CATEGORIES POLICIES (public read)
CREATE POLICY "Anyone can view categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.product_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- SUPPLIER PROFILES POLICIES
CREATE POLICY "Anyone can view verified suppliers" ON public.supplier_profiles FOR SELECT USING (verification_status = 'verified' OR user_id = auth.uid());
CREATE POLICY "Suppliers can update own profile" ON public.supplier_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Suppliers can insert own profile" ON public.supplier_profiles FOR INSERT WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'supplier'));
CREATE POLICY "Admins can manage all suppliers" ON public.supplier_profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PRODUCTS POLICIES
CREATE POLICY "Anyone can view approved products" ON public.products FOR SELECT USING (status = 'approved' OR supplier_id IN (SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Suppliers can manage own products" ON public.products FOR ALL USING (supplier_id IN (SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RECIPES POLICIES
CREATE POLICY "Anyone can view approved recipes" ON public.recipes FOR SELECT USING (status = 'approved' OR supplier_id IN (SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Suppliers can manage own recipes" ON public.recipes FOR ALL USING (supplier_id IN (SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all recipes" ON public.recipes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RECIPE INGREDIENTS POLICIES
CREATE POLICY "Anyone can view recipe ingredients" ON public.recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Suppliers can manage own recipe ingredients" ON public.recipe_ingredients FOR ALL USING (recipe_id IN (SELECT id FROM public.recipes WHERE supplier_id IN (SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid())));

-- SAVED SUPPLIERS POLICIES
CREATE POLICY "Users can view own saved suppliers" ON public.saved_suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved suppliers" ON public.saved_suppliers FOR ALL USING (auth.uid() = user_id);

-- SAVED PRODUCTS POLICIES
CREATE POLICY "Users can view own saved products" ON public.saved_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved products" ON public.saved_products FOR ALL USING (auth.uid() = user_id);

-- ENQUIRIES POLICIES
CREATE POLICY "Buyers can view own enquiries" ON public.enquiries FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Suppliers can view enquiries to them" ON public.enquiries FOR SELECT USING (supplier_id IN (SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Buyers can create enquiries" ON public.enquiries FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update own enquiries" ON public.enquiries FOR UPDATE USING (auth.uid() = buyer_id OR supplier_id IN (SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid()));

-- CONVERSATIONS POLICIES
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR supplier_id IN (SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Buyers can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = buyer_id OR supplier_id IN (SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid()));

-- MESSAGES POLICIES
CREATE POLICY "Users can view messages in own conversations" ON public.messages FOR SELECT USING (conversation_id IN (SELECT id FROM public.conversations WHERE buyer_id = auth.uid() OR supplier_id IN (SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can send messages in own conversations" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND conversation_id IN (SELECT id FROM public.conversations WHERE buyer_id = auth.uid() OR supplier_id IN (SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplier_profiles_updated_at BEFORE UPDATE ON public.supplier_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON public.enquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNCTION TO CREATE PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();