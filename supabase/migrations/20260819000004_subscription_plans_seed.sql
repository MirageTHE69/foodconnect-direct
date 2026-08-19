-- Seeds the new plan catalog per the confirmed spec. Business Growth and
-- Business Pro are seeded inactive (is_active = false) since their pricing
-- is still TBD -- they will not appear on Pricing/Subscribe until real
-- prices are set and the flag is flipped.

INSERT INTO public.subscription_plans
  (code, plan_type, business_category, name, description, credits_per_month, price_monthly, price_annual, is_popular, is_active, sort_order)
VALUES
  ('founders_5', 'category_credit', 'founders', 'Founders — 5 Credits/Month',
   'Clicking a company opens 5 credits'' worth of detail, rest blurred.', 5, 354, 4248, false, true, 10),
  ('founders_10', 'category_credit', 'founders', 'Founders — 10 Credits/Month',
   'Same as the 5-credit plan, higher monthly unlock volume.', 10, 472, 5664, false, true, 11),

  ('women_5', 'category_credit', 'women_enterprise', 'Women Enterprise — 5 Credits/Month',
   'Showcase products on site; 5 credits'' worth of company detail unlocked, rest blurred.', 5, 236, 2832, false, true, 20),
  ('women_10', 'category_credit', 'women_enterprise', 'Women Enterprise — 10 Credits/Month',
   'Same as the 5-credit plan, higher monthly unlock volume.', 10, 354, 4248, false, true, 21),

  ('ne_10', 'category_credit', 'north_east_startups', 'North East Startups — 10 Credits/Month',
   '10 credits'' worth of company detail unlocked, rest blurred.', 10, 236, 2832, false, true, 30),
  ('ne_20', 'category_credit', 'north_east_startups', 'North East Startups — 20 Credits/Month',
   'Same as the 10-credit plan, higher monthly unlock volume.', 20, 354, 4248, false, true, 31),

  ('micro_5', 'category_credit', 'micro_first_time', 'Micro & First-Time Startups — 5 Credits/Month',
   '5 credits'' worth of company detail unlocked, rest blurred.', 5, 236, 2832, false, true, 40),
  ('micro_10', 'category_credit', 'micro_first_time', 'Micro & First-Time Startups — 10 Credits/Month',
   '10 credits'' worth of company detail unlocked, rest blurred.', 10, 354, 4248, false, true, 41),

  ('shf_free', 'free', 'small_homemade_food', 'Small Homemade Food Products',
   'Showcase products/services on site only, no credit system.', NULL, 0, 0, false, true, 50),

  ('universal_b2b_b2c', 'universal_tier', NULL, 'B2B & B2C',
   'All categories fully open. No credit system — max access.', NULL, 1180, 14160, true, true, 60),
  ('universal_growth', 'universal_tier', NULL, 'Business Growth',
   'Unlimited products & recipes, unlimited chat, supplier contact visible, catalogue upload, verification badge, featured category listing, email notifications, profile insights. Auto-includes Buyer Pro.',
   NULL, 0, 0, false, false, 70),
  ('universal_pro', 'universal_tier', NULL, 'Business Pro',
   'Everything in Growth, plus homepage featured placement, export-ready badge, premium support, custom business banner, priority verification. Auto-includes Buyer Pro.',
   NULL, 0, 0, false, false, 80);
