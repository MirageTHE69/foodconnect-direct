
-- Job categories (hierarchical)
CREATE TABLE public.job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.job_categories(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view job categories" ON public.job_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage job categories" ON public.job_categories FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_type TEXT NOT NULL DEFAULT 'full-time',
  category_id UUID REFERENCES public.job_categories(id) ON DELETE SET NULL,
  experience_required TEXT,
  salary_range TEXT,
  description TEXT,
  requirements TEXT,
  responsibilities TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage jobs" ON public.jobs FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Applications (anonymous allowed)
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  resume_url TEXT,
  cover_note TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can apply" ON public.job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view applications" ON public.job_applications FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update applications" ON public.job_applications FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete applications" ON public.job_applications FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Resumes bucket (public read for admin download links)
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Anyone can upload resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Anyone can view resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');

-- Seed categories
WITH parents AS (
  INSERT INTO public.job_categories (name, display_order) VALUES
    ('Culinary & Kitchen Operations', 1),
    ('Restaurant & Hospitality Staff', 2),
    ('Food Production & Processing', 3),
    ('Food Technology & R&D', 4),
    ('Quality Control & Assurance', 5),
    ('Packaging & Design', 6),
    ('Supply Chain, Logistics & Warehouse', 7),
    ('Sales, Marketing & Business Development', 8),
    ('Retail & Store Operations', 9),
    ('Maintenance & Engineering', 10),
    ('Agriculture & Raw Material Sourcing', 11),
    ('Compliance, Certifications & Regulatory', 12),
    ('Corporate & Support Functions', 13),
    ('Gig & Blue-Collar Roles', 14)
  RETURNING id, name
)
INSERT INTO public.job_categories (name, parent_id, display_order)
SELECT sub.name, p.id, sub.ord FROM parents p JOIN (VALUES
  ('Culinary & Kitchen Operations','Executive Chef',1),('Culinary & Kitchen Operations','Sous Chef',2),('Culinary & Kitchen Operations','Chef de Partie (CDP)',3),('Culinary & Kitchen Operations','Commis (I, II, III)',4),('Culinary & Kitchen Operations','Tandoor Chef',5),('Culinary & Kitchen Operations','Bakery Chef / Pastry Chef',6),('Culinary & Kitchen Operations','Continental / Indian / Oriental Chef',7),('Culinary & Kitchen Operations','Butcher / Meat Cutter',8),('Culinary & Kitchen Operations','Kitchen Helper / Steward',9),('Culinary & Kitchen Operations','Food Stylist',10),
  ('Restaurant & Hospitality Staff','Restaurant Manager',1),('Restaurant & Hospitality Staff','Assistant Restaurant Manager',2),('Restaurant & Hospitality Staff','Captain / Floor Supervisor',3),('Restaurant & Hospitality Staff','Steward / Waiter',4),('Restaurant & Hospitality Staff','Bartender',5),('Restaurant & Hospitality Staff','Host / Hostess',6),('Restaurant & Hospitality Staff','Room Service Staff',7),('Restaurant & Hospitality Staff','Banquet Staff',8),('Restaurant & Hospitality Staff','Cashier (F&B)',9),
  ('Food Production & Processing','Production Manager (Food)',1),('Food Production & Processing','Production Supervisor',2),('Food Production & Processing','Machine Operator (FMCG / Food Processing)',3),('Food Production & Processing','Line Operator',4),('Food Production & Processing','Mixing / Blending Operator',5),('Food Production & Processing','Packaging Line Operator',6),('Food Production & Processing','Cold Storage Operator',7),('Food Production & Processing','IQF / Freezer Operator',8),('Food Production & Processing','Boiler Operator',9),('Food Production & Processing','Plant Operator',10),
  ('Food Technology & R&D','Food Technologist',1),('Food Technology & R&D','R&D Chef',2),('Food Technology & R&D','Product Development Manager',3),('Food Technology & R&D','Flavorist',4),('Food Technology & R&D','Nutritionist / Dietician',5),('Food Technology & R&D','Sensory Analyst / Food Taster',6),('Food Technology & R&D','Food Scientist',7),
  ('Quality Control & Assurance','Quality Analyst',1),('Quality Control & Assurance','QA/QC Manager',2),('Quality Control & Assurance','Microbiologist',3),('Quality Control & Assurance','Food Safety Officer',4),('Quality Control & Assurance','Lab Technician (Food Testing)',5),('Quality Control & Assurance','HACCP Coordinator',6),('Quality Control & Assurance','FSSAI Compliance Officer',7),
  ('Packaging & Design','Packaging Technologist',1),('Packaging & Design','Packaging Supervisor',2),('Packaging & Design','Packaging Machine Operator',3),('Packaging & Design','Labeling Executive',4),('Packaging & Design','Graphic Designer (Food Packaging)',5),('Packaging & Design','Printing Machine Operator',6),
  ('Supply Chain, Logistics & Warehouse','Supply Chain Manager',1),('Supply Chain, Logistics & Warehouse','Procurement Manager (Raw Materials)',2),('Supply Chain, Logistics & Warehouse','Inventory Manager',3),('Supply Chain, Logistics & Warehouse','Warehouse Supervisor',4),('Supply Chain, Logistics & Warehouse','Cold Chain Manager',5),('Supply Chain, Logistics & Warehouse','Logistics Coordinator',6),('Supply Chain, Logistics & Warehouse','Forklift Operator',7),('Supply Chain, Logistics & Warehouse','Loader / Unloader',8),('Supply Chain, Logistics & Warehouse','Delivery Executive',9),
  ('Sales, Marketing & Business Development','FMCG Sales Executive',1),('Sales, Marketing & Business Development','Area Sales Manager',2),('Sales, Marketing & Business Development','Key Account Manager (HoReCa)',3),('Sales, Marketing & Business Development','Export Manager (Food Products)',4),('Sales, Marketing & Business Development','Brand Manager',5),('Sales, Marketing & Business Development','Digital Marketing Executive (Food Brands)',6),('Sales, Marketing & Business Development','Trade Marketing Manager',7),
  ('Retail & Store Operations','Store Manager (Supermarket / Food Store)',1),('Retail & Store Operations','Retail Executive',2),('Retail & Store Operations','Counter Sales Staff',3),('Retail & Store Operations','Billing Executive',4),('Retail & Store Operations','Merchandiser',5),('Retail & Store Operations','Store Assistant',6),
  ('Maintenance & Engineering','Maintenance Engineer',1),('Maintenance & Engineering','Electrical Technician',2),('Maintenance & Engineering','Mechanical Technician',3),('Maintenance & Engineering','Refrigeration Technician (Cold Storage)',4),('Maintenance & Engineering','Utility Operator',5),('Maintenance & Engineering','Automation Engineer',6),
  ('Agriculture & Raw Material Sourcing','Farm Supervisor',1),('Agriculture & Raw Material Sourcing','Agri Procurement Officer',2),('Agriculture & Raw Material Sourcing','Fisheries Supervisor',3),('Agriculture & Raw Material Sourcing','Dairy Farm Manager',4),('Agriculture & Raw Material Sourcing','Quality Grader (Raw Materials)',5),
  ('Compliance, Certifications & Regulatory','FSSAI Consultant',1),('Compliance, Certifications & Regulatory','ISO / BRC Auditor',2),('Compliance, Certifications & Regulatory','Regulatory Affairs Manager',3),('Compliance, Certifications & Regulatory','Documentation Executive',4),('Compliance, Certifications & Regulatory','Export Compliance Officer',5),
  ('Corporate & Support Functions','HR Manager (Food Industry)',1),('Corporate & Support Functions','Accountant',2),('Corporate & Support Functions','Admin Executive',3),('Corporate & Support Functions','Purchase Executive',4),('Corporate & Support Functions','Legal Executive',5),
  ('Gig & Blue-Collar Roles','Kitchen Helper',1),('Gig & Blue-Collar Roles','Delivery Boy',2),('Gig & Blue-Collar Roles','Packing Staff',3),('Gig & Blue-Collar Roles','Helpers (Factory)',4),('Gig & Blue-Collar Roles','Cleaners / Housekeeping',5),('Gig & Blue-Collar Roles','Loaders / Unloaders',6),('Gig & Blue-Collar Roles','Street Food Vendors',7)
) AS sub(parent_name, name, ord) ON p.name = sub.parent_name;
