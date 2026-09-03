// Feature-access matrix, built from FoodAdda_Subscription_Plans_Complete.pdf
// Section 1. Two resolved ambiguities (confirmed with the business owner,
// 2026-09-01): the PDF marked Women Enterprise / Micro & First-Time Startups
// as full-access (✓) on most rows while Founders / NE Startups stayed
// "Limited" on the same rows -- confirmed as a spec error, so Women
// Enterprise and Micro/First-Time now mirror Founders/NE Startups' credit-
// gated "limited" behavior. "Homemade" (Small Homemade Food Products) was
// almost entirely blank ("n/s") in the source sheet -- confirmed to default
// to Guest-level access, since it's a free showcase-only tier.

export type Tier =
  | 'guest'
  | 'founders'
  | 'women_enterprise'
  | 'north_east_startups'
  | 'b2b_b2c'
  | 'micro_first_time'
  | 'small_homemade_food';

export type AccessLevel = 'full' | 'limited' | 'none' | 'summary';

export type FeatureKey =
  | 'search_categories'
  | 'search_products'
  | 'view_company_name'
  | 'view_company_summary'
  | 'view_product_photos'
  | 'full_product_specs'
  | 'full_catalogue'
  | 'contact_person'
  | 'phone_number'
  | 'email'
  | 'website'
  | 'send_enquiry'
  | 'save_suppliers'
  | 'compare_suppliers'
  | 'view_certifications'
  | 'manufacturing_capability'
  | 'moq'
  | 'oem_private_label'
  | 'export_capabilities'
  | 'post_sourcing_requirement'
  | 'enquiry_history'
  | 'buyer_sourcing_dashboard';

const TIERS: Tier[] = [
  'guest',
  'founders',
  'women_enterprise',
  'north_east_startups',
  'b2b_b2c',
  'micro_first_time',
  'small_homemade_food',
];

function row(values: [AccessLevel, AccessLevel, AccessLevel, AccessLevel, AccessLevel, AccessLevel, AccessLevel]): Record<Tier, AccessLevel> {
  return Object.fromEntries(TIERS.map((tier, i) => [tier, values[i]])) as Record<Tier, AccessLevel>;
}

//                                    guest      founders   women_ent  ne_startups b2b_b2c   micro      homemade
const MATRIX: Record<FeatureKey, Record<Tier, AccessLevel>> = {
  search_categories:          row(['full',    'full',    'full',    'full',    'full',    'full',    'full']),
  search_products:            row(['full',    'full',    'full',    'full',    'full',    'full',    'full']),
  view_company_name:          row(['full',    'full',    'full',    'full',    'full',    'full',    'full']),
  view_company_summary:       row(['full',    'full',    'full',    'full',    'full',    'full',    'full']),
  view_product_photos:        row(['full',    'full',    'full',    'full',    'full',    'full',    'full']),
  full_product_specs:         row(['limited', 'limited', 'limited', 'limited', 'full',    'limited', 'limited']),
  full_catalogue:              row(['none',    'limited', 'limited', 'limited', 'full',    'limited', 'none']),
  contact_person:             row(['none',    'limited', 'limited', 'limited', 'full',    'limited', 'none']),
  phone_number:                row(['none',    'limited', 'limited', 'limited', 'full',    'limited', 'none']),
  email:                       row(['none',    'none',    'none',    'none',    'full',    'none',    'none']),
  website:                     row(['limited', 'limited', 'limited', 'limited', 'full',    'limited', 'limited']),
  send_enquiry:                row(['none',    'limited', 'limited', 'limited', 'full',    'limited', 'none']),
  save_suppliers:              row(['none',    'full',    'full',    'full',    'full',    'full',    'none']),
  compare_suppliers:           row(['none',    'limited', 'limited', 'limited', 'full',    'limited', 'none']),
  view_certifications:         row(['summary', 'full',    'full',    'full',    'full',    'full',    'summary']),
  manufacturing_capability:    row(['limited', 'limited', 'limited', 'limited', 'full',    'limited', 'limited']),
  moq:                         row(['none',    'limited', 'limited', 'limited', 'full',    'limited', 'none']),
  oem_private_label:           row(['none',    'none',    'none',    'none',    'full',    'none',    'none']),
  export_capabilities:         row(['summary', 'limited', 'limited', 'limited', 'full',    'limited', 'summary']),
  post_sourcing_requirement:   row(['none',    'limited', 'limited', 'none',    'full',    'limited', 'none']),
  enquiry_history:              row(['none',    'none',    'none',    'none',    'full',    'none',    'none']),
  buyer_sourcing_dashboard:     row(['none',    'none',    'none',    'none',    'full',    'none',    'none']),
};

export function getAccess(tier: Tier, feature: FeatureKey): AccessLevel {
  return MATRIX[feature][tier];
}

const TIER_LABELS: Record<Tier, string> = {
  guest: 'Guest',
  founders: 'Founders',
  women_enterprise: 'Women Enterprise',
  north_east_startups: 'North East Startups',
  b2b_b2c: 'B2B & B2C',
  micro_first_time: 'Micro & First-Time Startups',
  small_homemade_food: 'Small Homemade Food Products',
};

export function getTierLabel(tier: Tier): string {
  return TIER_LABELS[tier];
}

// Maps a subscription_plans.business_category enum value (or null for a
// universal_tier plan) to the matrix's Tier key. universal_tier plans
// (B2B & B2C, and the not-yet-fully-speced Business Growth/Pro tiers) all
// map to 'b2b_b2c' -- the matrix's only "flat-fee, full access" column,
// consistent with Section 3's framing of those tiers as supersets of it.
export function resolveTier(
  planType: 'free' | 'category_credit' | 'universal_tier' | null | undefined,
  businessCategory: string | null | undefined,
): Tier {
  if (planType === 'universal_tier') return 'b2b_b2c';
  if (planType === 'category_credit' || planType === 'free') {
    if (businessCategory && TIERS.includes(businessCategory as Tier)) {
      return businessCategory as Tier;
    }
  }
  return 'guest';
}
