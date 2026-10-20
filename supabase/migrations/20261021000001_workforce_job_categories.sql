-- Replace job categories with the 22-category food industry workforce list
-- (category -> group -> role). No jobs used the old categories; jobs.category_id
-- is ON DELETE SET NULL anyway.
DELETE FROM public.job_categories;

DO $$
DECLARE cat uuid; grp uuid;
BEGIN
  INSERT INTO public.job_categories (name, display_order) VALUES ('Agriculture & Farm', 1) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Crop Production', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Farm Labourer', grp, 1),
    ('Field Worker', grp, 2),
    ('Crop Worker', grp, 3),
    ('Sowing Worker', grp, 4),
    ('Planting Worker', grp, 5),
    ('Weeding Worker', grp, 6),
    ('Irrigation Worker', grp, 7),
    ('Fertilizer Application Worker', grp, 8),
    ('Crop Protection Worker', grp, 9),
    ('Harvesting Worker', grp, 10),
    ('Sorting Worker', grp, 11),
    ('Grading Worker', grp, 12),
    ('Farm Supervisor', grp, 13),
    ('Farm Equipment Operator', grp, 14);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Horticulture', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Fruit Farm Worker', grp, 1),
    ('Vegetable Farm Worker', grp, 2),
    ('Nursery Worker', grp, 3),
    ('Floriculture Worker', grp, 4),
    ('Protected Cultivation Worker', grp, 5),
    ('Greenhouse Worker', grp, 6),
    ('Hydroponics Technician', grp, 7),
    ('Drip Irrigation Technician', grp, 8),
    ('Orchard Worker', grp, 9);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Post-Harvest', cat, 3) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Harvesting Labourer', grp, 1),
    ('Farm Sorter', grp, 2),
    ('Grader', grp, 3),
    ('Packhouse Worker', grp, 4),
    ('Crate Handler', grp, 5),
    ('Weighing Operator', grp, 6),
    ('Pre-cooling Operator', grp, 7),
    ('Agricultural Warehouse Worker', grp, 8);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Dairy Industry', 2) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Dairy Farm', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Dairy Farm Worker', grp, 1),
    ('Milking Operator', grp, 2),
    ('Dairy Farm Supervisor', grp, 3),
    ('Cattle Feed Worker', grp, 4),
    ('Animal Care Worker', grp, 5),
    ('Dairy Farm Cleaner', grp, 6),
    ('Veterinary Assistant', grp, 7),
    ('Feed Mixing Operator', grp, 8);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Dairy Processing', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Milk Reception Operator', grp, 1),
    ('Milk Testing Technician', grp, 2),
    ('Pasteurization Operator', grp, 3),
    ('Homogenizer Operator', grp, 4),
    ('Cream Separator Operator', grp, 5),
    ('Butter Making Operator', grp, 6),
    ('Ghee Production Operator', grp, 7),
    ('Paneer Maker', grp, 8),
    ('Cheese Production Operator', grp, 9),
    ('Yogurt/Curd Production Operator', grp, 10),
    ('Ice Cream Production Operator', grp, 11),
    ('CIP Operator', grp, 12),
    ('Filling Machine Operator', grp, 13),
    ('Packing Operator', grp, 14),
    ('Cold Storage Operator', grp, 15);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Meat Processing', 3) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Primary Processing', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Butcher', grp, 1),
    ('Slaughterhouse Worker', grp, 2),
    ('Meat Cutting Worker', grp, 3),
    ('Deboning Worker', grp, 4),
    ('Trimming Worker', grp, 5),
    ('Skinning Worker', grp, 6),
    ('Evisceration Worker', grp, 7),
    ('Meat Grader', grp, 8);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Further Processing', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Meat Marination Operator', grp, 1),
    ('Sausage Maker', grp, 2),
    ('Kebab Production Worker', grp, 3),
    ('Nugget Production Operator', grp, 4),
    ('Patty Machine Operator', grp, 5),
    ('Meatball Production Worker', grp, 6),
    ('Ready-to-Cook Production Worker', grp, 7),
    ('Ready-to-Eat Production Worker', grp, 8);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('QA & Hygiene', cat, 3) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Meat Hygiene Worker', grp, 1),
    ('Sanitation Worker', grp, 2),
    ('QA Assistant', grp, 3),
    ('Metal Detector Operator', grp, 4),
    ('Temperature Monitoring Operator', grp, 5),
    ('Cold Room Operator', grp, 6);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Fish & Seafood', 4) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Primary Processing', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Fish Receiving Worker', grp, 1),
    ('Fish Sorter', grp, 2),
    ('Fish Grader', grp, 3),
    ('Fish Cleaner', grp, 4),
    ('Fish Cutting Operator', grp, 5),
    ('Filleting Operator', grp, 6),
    ('Skinning Operator', grp, 7),
    ('Descaling Worker', grp, 8),
    ('Deveining Worker', grp, 9),
    ('Shrimp/Prawn Processing Worker', grp, 10);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Processing', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('IQF Operator', grp, 1),
    ('Blast Freezer Operator', grp, 2),
    ('Tunnel Freezer Operator', grp, 3),
    ('Glazing Operator', grp, 4),
    ('Breaded Seafood Operator', grp, 5),
    ('Marination Operator', grp, 6),
    ('Seafood Packing Operator', grp, 7),
    ('Vacuum Packing Operator', grp, 8);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Cold Chain', cat, 3) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Cold Store Operator', grp, 1),
    ('Refrigeration Technician', grp, 2),
    ('Reefer Loading Worker', grp, 3),
    ('Temperature Monitoring Technician', grp, 4);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Food Manufacturing', 5) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Production', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Production Helper', grp, 1),
    ('Production Worker', grp, 2),
    ('Line Worker', grp, 3),
    ('Production Operator', grp, 4),
    ('Machine Operator', grp, 5),
    ('Production Supervisor', grp, 6),
    ('Production Executive', grp, 7),
    ('Production Manager', grp, 8),
    ('Plant Manager', grp, 9);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Processing', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Washing Operator', grp, 1),
    ('Sorting Operator', grp, 2),
    ('Peeling Operator', grp, 3),
    ('Cutting Operator', grp, 4),
    ('Slicing Operator', grp, 5),
    ('Dicing Operator', grp, 6),
    ('Grinding Operator', grp, 7),
    ('Milling Operator', grp, 8),
    ('Mixing Operator', grp, 9),
    ('Blending Operator', grp, 10),
    ('Cooking Operator', grp, 11),
    ('Frying Operator', grp, 12),
    ('Roasting Operator', grp, 13),
    ('Baking Operator', grp, 14),
    ('Drying Operator', grp, 15),
    ('Pasteurization Operator', grp, 16),
    ('Sterilization Operator', grp, 17),
    ('Homogenization Operator', grp, 18),
    ('Fermentation Operator', grp, 19),
    ('Extrusion Operator', grp, 20);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Spice Industry', 6) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Raw Material', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Spice Receiving Worker', grp, 1),
    ('Spice Cleaning Worker', grp, 2),
    ('Destoning Operator', grp, 3),
    ('Grading Operator', grp, 4),
    ('Sorting Operator', grp, 5);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Processing', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Roasting Operator', grp, 1),
    ('Grinding Operator', grp, 2),
    ('Pulverizer Operator', grp, 3),
    ('Hammer Mill Operator', grp, 4),
    ('Pin Mill Operator', grp, 5),
    ('Blender Operator', grp, 6),
    ('Ribbon Blender Operator', grp, 7),
    ('Sifter Operator', grp, 8),
    ('Sieving Operator', grp, 9),
    ('Sterilization Operator', grp, 10);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Packaging', cat, 3) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Powder Filling Operator', grp, 1),
    ('Pouch Packing Operator', grp, 2),
    ('Sachet Machine Operator', grp, 3),
    ('Labeling Operator', grp, 4),
    ('Coding Operator', grp, 5),
    ('Cartoning Operator', grp, 6);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Quality', cat, 4) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Spice QA Technician', grp, 1),
    ('Microbiology Technician', grp, 2),
    ('Adulteration Testing Assistant', grp, 3),
    ('Moisture Testing Technician', grp, 4);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Bakery & Confectionery', 7) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Bakery', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Baker', grp, 1),
    ('Bakery Assistant', grp, 2),
    ('Dough Maker', grp, 3),
    ('Mixer Operator', grp, 4),
    ('Fermentation Operator', grp, 5),
    ('Bread Baker', grp, 6),
    ('Bun Baker', grp, 7),
    ('Croissant Baker', grp, 8),
    ('Biscuit Maker', grp, 9),
    ('Cake Baker', grp, 10),
    ('Pastry Chef', grp, 11),
    ('Cake Decorator', grp, 12),
    ('Chocolate Maker', grp, 13);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Confectionery', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Candy Maker', grp, 1),
    ('Toffee Operator', grp, 2),
    ('Chocolate Tempering Operator', grp, 3),
    ('Chocolate Moulding Operator', grp, 4),
    ('Coating Operator', grp, 5),
    ('Enrobing Operator', grp, 6),
    ('Depositing Machine Operator', grp, 7),
    ('Packaging Operator', grp, 8);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Beverage Industry', 8) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Beverage Production Operator', cat, 1),
    ('Juice Processing Operator', cat, 2),
    ('Fruit Pulp Operator', cat, 3),
    ('Blending Operator', cat, 4),
    ('Syrup Preparation Operator', cat, 5),
    ('Carbonation Operator', cat, 6),
    ('Pasteurization Operator', cat, 7),
    ('UHT Operator', cat, 8),
    ('Bottling Operator', cat, 9),
    ('Filling Operator', cat, 10),
    ('Capping Operator', cat, 11),
    ('Labeling Operator', cat, 12),
    ('Shrink-Wrapping Operator', cat, 13),
    ('CIP Operator', cat, 14),
    ('Water Treatment Operator', cat, 15),
    ('RO Plant Operator', cat, 16),
    ('ETP Operator', cat, 17),
    ('Boiler Operator', cat, 18),
    ('Refrigeration Operator', cat, 19);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Ready-to-Eat / Ready-to-Cook', 9) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('RTE Production Worker', cat, 1),
    ('RTC Production Worker', cat, 2),
    ('Meal Assembly Worker', cat, 3),
    ('Sauce Preparation Operator', cat, 4),
    ('Gravy Production Operator', cat, 5),
    ('Marination Worker', cat, 6),
    ('Portioning Operator', cat, 7),
    ('Tray Sealing Operator', cat, 8),
    ('Retort Operator', cat, 9),
    ('Blast Freezer Operator', cat, 10),
    ('IQF Operator', cat, 11),
    ('Vacuum Packing Operator', cat, 12),
    ('MAP Packing Operator', cat, 13);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Food Packaging', 10) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Operators', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Filling Machine Operator', grp, 1),
    ('VFFS Operator', grp, 2),
    ('HFFS Operator', grp, 3),
    ('Pouch Packing Operator', grp, 4),
    ('Sachet Machine Operator', grp, 5),
    ('Bottle Filling Operator', grp, 6),
    ('Tube Filling Operator', grp, 7),
    ('Cartoning Operator', grp, 8),
    ('Case Packing Operator', grp, 9),
    ('Palletizing Operator', grp, 10);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Packaging Support', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Packaging Helper', grp, 1),
    ('Packaging Line Worker', grp, 2),
    ('Label Applicator', grp, 3),
    ('Coding Machine Operator', grp, 4),
    ('Inkjet Operator', grp, 5),
    ('Batch Coding Operator', grp, 6),
    ('Checkweigher Operator', grp, 7),
    ('Metal Detector Operator', grp, 8),
    ('X-Ray Inspection Operator', grp, 9);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Quality Control & Food Safety', 11) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Laboratory', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Laboratory Assistant', grp, 1),
    ('Lab Technician', grp, 2),
    ('Microbiology Technician', grp, 3),
    ('Chemical Analyst', grp, 4),
    ('Food Analyst', grp, 5),
    ('Sensory Evaluation Technician', grp, 6),
    ('Sampling Technician', grp, 7);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('QA/QC', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('QA Assistant', grp, 1),
    ('QC Assistant', grp, 2),
    ('QA Executive', grp, 3),
    ('QC Executive', grp, 4),
    ('QA Supervisor', grp, 5),
    ('QC Supervisor', grp, 6),
    ('Quality Manager', grp, 7),
    ('Food Safety Officer', grp, 8);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Food Safety', cat, 3) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('HACCP Coordinator', grp, 1),
    ('GMP Coordinator', grp, 2),
    ('Hygiene Officer', grp, 3),
    ('Sanitation Supervisor', grp, 4),
    ('Pest-Control Coordinator', grp, 5),
    ('Traceability Executive', grp, 6),
    ('Recall Coordinator', grp, 7),
    ('Supplier Quality Executive', grp, 8);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Food Technology & R&D', 12) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Product Development', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Food Technologist', grp, 1),
    ('Food Scientist', grp, 2),
    ('R&D Executive', grp, 3),
    ('Product Development Executive', grp, 4),
    ('Product Development Manager', grp, 5),
    ('Recipe Developer', grp, 6),
    ('Formulation Scientist', grp, 7),
    ('Sensory Analyst', grp, 8);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Specialized', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Dairy Technologist', grp, 1),
    ('Meat Technologist', grp, 2),
    ('Seafood Technologist', grp, 3),
    ('Bakery Technologist', grp, 4),
    ('Cereal Technologist', grp, 5),
    ('Beverage Technologist', grp, 6),
    ('Confectionery Technologist', grp, 7),
    ('Spice Technologist', grp, 8),
    ('Fermentation Technologist', grp, 9),
    ('Packaging Technologist', grp, 10);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Cold Chain', 13) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Cold Storage Worker', cat, 1),
    ('Cold Room Operator', cat, 2),
    ('Freezer Operator', cat, 3),
    ('Blast Freezer Operator', cat, 4),
    ('IQF Operator', cat, 5),
    ('Refrigeration Technician', cat, 6),
    ('HVAC Technician', cat, 7),
    ('Ammonia Refrigeration Technician', cat, 8),
    ('CO2 Refrigeration Technician', cat, 9),
    ('Cold Chain Supervisor', cat, 10),
    ('Temperature Monitoring Technician', cat, 11),
    ('Reefer Technician', cat, 12);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Food Logistics', 14) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Drivers', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Food Delivery Driver', grp, 1),
    ('Reefer Truck Driver', grp, 2),
    ('Mini Truck Driver', grp, 3),
    ('Heavy Commercial Vehicle Driver', grp, 4),
    ('Tanker Driver', grp, 5),
    ('Container Driver', grp, 6),
    ('Local Delivery Driver', grp, 7);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Warehouse', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Warehouse Helper', grp, 1),
    ('Picker', grp, 2),
    ('Packer', grp, 3),
    ('Loader', grp, 4),
    ('Unloader', grp, 5),
    ('Forklift Operator', grp, 6),
    ('Pallet Jack Operator', grp, 7),
    ('Warehouse Executive', grp, 8),
    ('Warehouse Supervisor', grp, 9);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Supply Chain', cat, 3) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Dispatch Executive', grp, 1),
    ('Logistics Executive', grp, 2),
    ('Transport Coordinator', grp, 3),
    ('Fleet Supervisor', grp, 4),
    ('Route Planner', grp, 5),
    ('Supply Chain Executive', grp, 6),
    ('Supply Chain Manager', grp, 7);
  INSERT INTO public.job_categories (name, display_order) VALUES ('HoReCa', 15) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Kitchen', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Executive Chef', grp, 1),
    ('Sous Chef', grp, 2),
    ('Chef de Partie', grp, 3),
    ('Commis Chef', grp, 4),
    ('Demi Chef', grp, 5),
    ('Kitchen Helper', grp, 6),
    ('Tandoor Chef', grp, 7),
    ('Indian Chef', grp, 8),
    ('Chinese Chef', grp, 9),
    ('Continental Chef', grp, 10),
    ('Italian Chef', grp, 11),
    ('Bakery Chef', grp, 12),
    ('Pastry Chef', grp, 13),
    ('Salad Chef', grp, 14),
    ('Garde Manger', grp, 15),
    ('Butcher', grp, 16),
    ('Fish Cutter', grp, 17);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Restaurant', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Restaurant Manager', grp, 1),
    ('Assistant Restaurant Manager', grp, 2),
    ('Captain', grp, 3),
    ('Steward', grp, 4),
    ('Waiter', grp, 5),
    ('Host/Hostess', grp, 6),
    ('Cashier', grp, 7),
    ('Bartender', grp, 8),
    ('Busser', grp, 9),
    ('Dishwasher', grp, 10);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Hotel', cat, 3) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('F&B Manager', grp, 1),
    ('Banquet Manager', grp, 2),
    ('Banquet Captain', grp, 3),
    ('Room Service Staff', grp, 4),
    ('Kitchen Steward', grp, 5),
    ('Stewarding Supervisor', grp, 6),
    ('Central Kitchen Staff', grp, 7);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Cloud Kitchen & Central Kitchen', 16) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Central Kitchen Manager', cat, 1),
    ('Production Chef', cat, 2),
    ('Commis', cat, 3),
    ('Food Preparation Worker', cat, 4),
    ('Portioning Worker', cat, 5),
    ('Meal Assembly Worker', cat, 6),
    ('Packing Worker', cat, 7),
    ('Dispatch Worker', cat, 8),
    ('Kitchen Supervisor', cat, 9),
    ('Inventory Controller', cat, 10),
    ('Food Cost Controller', cat, 11),
    ('Delivery Coordinator', cat, 12);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Maintenance', 17) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Mechanical', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Mechanical Technician', grp, 1),
    ('Maintenance Technician', grp, 2),
    ('Fitter', grp, 3),
    ('Welder', grp, 4),
    ('Fabricator', grp, 5),
    ('Machine Maintenance Technician', grp, 6);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Electrical', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Electrician', grp, 1),
    ('Electrical Technician', grp, 2),
    ('Control Panel Technician', grp, 3),
    ('PLC Technician', grp, 4),
    ('Instrumentation Technician', grp, 5);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Utilities', cat, 3) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Boiler Operator', grp, 1),
    ('Compressor Operator', grp, 2),
    ('Refrigeration Technician', grp, 3),
    ('RO Plant Operator', grp, 4),
    ('ETP Operator', grp, 5),
    ('STP Operator', grp, 6),
    ('Utility Operator', grp, 7);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Sanitation & Hygiene', 18) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Cleaning Worker', cat, 1),
    ('Food Plant Sanitation Worker', cat, 2),
    ('CIP Operator', cat, 3),
    ('COP Operator', cat, 4),
    ('Hygiene Worker', cat, 5),
    ('Hygiene Supervisor', cat, 6),
    ('Pest-Control Technician', cat, 7),
    ('Waste Management Worker', cat, 8),
    ('ETP Worker', cat, 9),
    ('Bio-waste Handler', cat, 10),
    ('Effluent Treatment Operator', cat, 11);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Warehouse & Inventory', 19) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Inventory', cat, 1) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Inventory Assistant', grp, 1),
    ('Storekeeper', grp, 2),
    ('Store Executive', grp, 3),
    ('Inventory Controller', grp, 4),
    ('Warehouse Executive', grp, 5),
    ('Warehouse Supervisor', grp, 6);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Specialized', cat, 2) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Cold Store Operator', grp, 1),
    ('Frozen Warehouse Worker', grp, 2),
    ('Food Grain Warehouse Worker', grp, 3),
    ('Chemical Storekeeper', grp, 4),
    ('Packaging Material Storekeeper', grp, 5),
    ('Spare Parts Storekeeper', grp, 6);
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES ('Technology', cat, 3) RETURNING id INTO grp;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('WMS Operator', grp, 1),
    ('Barcode Operator', grp, 2),
    ('Scanner Operator', grp, 3),
    ('Inventory Data Entry Operator', grp, 4);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Sales & Commercial', 20) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Sales Executive', cat, 1),
    ('Territory Sales Executive', cat, 2),
    ('Distributor Sales Executive', cat, 3),
    ('HORECA Sales Executive', cat, 4),
    ('Institutional Sales Executive', cat, 5),
    ('Modern Trade Executive', cat, 6),
    ('Export Sales Executive', cat, 7),
    ('Business Development Executive', cat, 8),
    ('Key Account Manager', cat, 9),
    ('Sales Manager', cat, 10);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Procurement', 21) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Purchase Assistant', cat, 1),
    ('Purchase Executive', cat, 2),
    ('Procurement Executive', cat, 3),
    ('Sourcing Executive', cat, 4),
    ('Commodity Buyer', cat, 5),
    ('Raw Material Buyer', cat, 6),
    ('Packaging Buyer', cat, 7),
    ('HORECA Buyer', cat, 8),
    ('Strategic Sourcing Manager', cat, 9),
    ('Procurement Manager', cat, 10);
  INSERT INTO public.job_categories (name, display_order) VALUES ('Food Industry Digital Jobs', 22) RETURNING id INTO cat;
  INSERT INTO public.job_categories (name, parent_id, display_order) VALUES
    ('Food E-commerce Executive', cat, 1),
    ('Marketplace Executive', cat, 2),
    ('Food Catalog Executive', cat, 3),
    ('Product Data Executive', cat, 4),
    ('ERP Operator', cat, 5),
    ('WMS Operator', cat, 6),
    ('Procurement Software Operator', cat, 7),
    ('Digital Marketing Executive', cat, 8),
    ('Social Media Executive', cat, 9),
    ('Food Photographer', cat, 10),
    ('Food Videographer', cat, 11),
    ('Product Listing Executive', cat, 12),
    ('Customer Support Executive', cat, 13),
    ('B2B Sales Executive', cat, 14),
    ('CRM Executive', cat, 15),
    ('Data Entry Operator', cat, 16);
END $$;
