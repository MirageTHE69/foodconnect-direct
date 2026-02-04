-- Change default status for products from 'pending' to 'approved'
ALTER TABLE public.products ALTER COLUMN status SET DEFAULT 'approved'::product_status;

-- Change default status for recipes from 'pending' to 'approved'
ALTER TABLE public.recipes ALTER COLUMN status SET DEFAULT 'approved'::product_status;