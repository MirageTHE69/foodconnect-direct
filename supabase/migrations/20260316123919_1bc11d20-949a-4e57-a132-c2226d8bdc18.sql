
-- Create user type enum
CREATE TYPE public.user_type AS ENUM ('b2b', 'b2c', 'horeca', 'franchise', 'recruitment');

-- Create registration_profiles table
CREATE TABLE public.registration_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  company_name TEXT,
  full_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  google_location TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  gst_number TEXT,
  gst_verified BOOLEAN DEFAULT false,
  fssai_number TEXT,
  product_description TEXT,
  contact_person_name TEXT,
  contact_designation TEXT,
  contact_phone TEXT,
  moq TEXT,
  horeca_category TEXT,
  menu_description TEXT,
  preferred_franchise_location TEXT,
  franchise_category TEXT,
  qualification TEXT,
  years_experience TEXT,
  job_category TEXT,
  preferred_city TEXT,
  uploaded_photos TEXT[] DEFAULT '{}',
  menu_upload_url TEXT,
  cv_url TEXT,
  passport_photo_url TEXT,
  aadhar_front_url TEXT,
  aadhar_back_url TEXT,
  terms_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.registration_profiles ENABLE ROW LEVEL SECURITY;

-- Users can insert their own registration profiles
CREATE POLICY "Users can insert own registration" ON public.registration_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view their own registration profiles
CREATE POLICY "Users can view own registration" ON public.registration_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can update their own registration profiles
CREATE POLICY "Users can update own registration" ON public.registration_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Admins can view all registration profiles
CREATE POLICY "Admins can view all registrations" ON public.registration_profiles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for registration files
INSERT INTO storage.buckets (id, name, public) VALUES ('registration_files', 'registration_files', true);

-- Storage RLS: authenticated users can upload to their own folder
CREATE POLICY "Users can upload registration files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'registration_files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Anyone can view registration files (public bucket)
CREATE POLICY "Public can view registration files" ON storage.objects
  FOR SELECT USING (bucket_id = 'registration_files');

-- Users can delete their own registration files
CREATE POLICY "Users can delete own registration files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'registration_files' AND (storage.foldername(name))[1] = auth.uid()::text);
