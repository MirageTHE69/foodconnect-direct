-- General talent-pool submissions: a candidate can drop off a resume +
-- skill list on the Jobs page without applying to a specific listing.
-- Admins review these separately from per-job applications.
CREATE TABLE public.talent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  resume_url TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'shortlisted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a talent profile" ON public.talent_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view talent profiles" ON public.talent_profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update talent profiles" ON public.talent_profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete talent profiles" ON public.talent_profiles FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Reuses the existing public "resumes" storage bucket (created alongside
-- job_applications) — submissions here are stored under a talent/ prefix.
