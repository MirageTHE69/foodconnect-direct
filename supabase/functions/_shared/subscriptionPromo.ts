// Mirrors src/lib/subscriptionPromo.ts exactly -- Deno edge functions can't
// import from the Vite src/ tree. Keep both in sync.
//
// The only free month is the one every account gets at sign-up (see
// grant_free_trial in the database). Paid plans carry no bonus month:
// monthly billing buys 1 month, annual billing buys 12.
export const TRIAL_MONTHS = 1;

export function computeSubscriptionMonths(billingCycle: 'monthly' | 'annual'): number {
  return billingCycle === 'annual' ? 12 : 1;
}

/**
 * A plan bought while the user still has access (their free month, or an
 * unexpired plan) starts when that access ends, so buying early never costs
 * them days. Otherwise it starts now.
 */
export function computeSubscriptionPeriod(
  billingCycle: 'monthly' | 'annual',
  currentAccessEndsAt: string | null,
): { startsAt: Date; expiresAt: Date } {
  const now = new Date();
  const currentEnd = currentAccessEndsAt ? new Date(currentAccessEndsAt) : null;
  const startsAt = currentEnd && currentEnd > now ? currentEnd : now;
  const expiresAt = new Date(startsAt);
  expiresAt.setMonth(expiresAt.getMonth() + computeSubscriptionMonths(billingCycle));
  return { startsAt, expiresAt };
}
