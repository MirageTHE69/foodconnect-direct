// Mirrored in supabase/functions/_shared/subscriptionPromo.ts for the
// Cashfree webhook (Deno edge functions can't import from this src/ tree) --
// keep both in sync if this changes.
// Current launch promo: every paid plan includes 1 month free, on BOTH
// monthly and annual billing (not just annual). Annual pricing already has
// the free month baked into price_annual (12 months' price = 13 months'
// access), so only monthly billing needs the extra month added here.
// To end the promo later, change MONTHLY_BONUS_MONTHS back to 0.
export const MONTHLY_BONUS_MONTHS = 1;
export const ANNUAL_ACCESS_MONTHS = 13;

export function computeSubscriptionMonths(billingCycle: 'monthly' | 'annual'): number {
  return billingCycle === 'annual' ? ANNUAL_ACCESS_MONTHS : 1 + MONTHLY_BONUS_MONTHS;
}
