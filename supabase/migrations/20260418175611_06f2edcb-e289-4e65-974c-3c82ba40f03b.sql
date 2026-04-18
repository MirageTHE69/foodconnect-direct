
-- Add sub-categories for categories that don't have any
INSERT INTO public.sub_categories (category_id, name, description, display_order) VALUES
('56dc4279-f64e-4eea-b409-9c6a6434b103', 'Farm Inputs & Supplies', 'Seeds, fertilizers, agro inputs', 1),
('aab6ed87-4d7c-4893-bd33-61111f649844', 'Namkeen & Savouries', 'Indian savoury snacks', 1),
('aab6ed87-4d7c-4893-bd33-61111f649844', 'Sweets & Mithai', 'Traditional Indian sweets', 2),
('aab6ed87-4d7c-4893-bd33-61111f649844', 'Wafers & Chips', 'Indian wafers and chip snacks', 3),
('ece472c5-45d6-4c54-9210-c97e3e47da1c', 'Private Label Manufacturers', 'White label / private label manufacturing', 1),
('81ef6748-33a4-43d0-9736-167bf63eaa5c', 'EPC Contractors', 'Engineering, procurement & construction', 1),
('81ef6748-33a4-43d0-9736-167bf63eaa5c', 'Solution Providers & Consultants', 'Industry consultants & solutions', 2),
('81ef6748-33a4-43d0-9736-167bf63eaa5c', 'Testing Labs & Certifications', 'Food testing & certification labs', 3);
