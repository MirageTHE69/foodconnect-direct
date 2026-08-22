// Mirrors src/lib/subscriptionPromo.ts EXACTLY. Edge functions (Deno) can't
// import from the Vite/browser src tree, so this is a deliberate duplicate.
// If you change the promo logic in src/lib/subscriptionPromo.ts, update this
// file too (and vice versa) -- the manual admin-approval flow and the
// Cashfree webhook activation must compute identical access windows.
export const MONTHLY_BONUS_MONTHS = 1;
export const ANNUAL_ACCESS_MONTHS = 13;

export function computeSubscriptionMonths(billingCycle: 'monthly' | 'annual'): number {
  return billingCycle === 'annual' ? ANNUAL_ACCESS_MONTHS : 1 + MONTHLY_BONUS_MONTHS;
}
