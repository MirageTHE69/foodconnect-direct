import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { getAccess, getTierLabel, resolveTier, type AccessLevel, type FeatureKey, type Tier } from '@/lib/permissions';

/**
 * Resolves the current visitor's access tier (Guest, a category-credit
 * plan, or the flat-fee B2B & B2C tier) and exposes a can() lookup against
 * the feature-access matrix in src/lib/permissions.ts. Admins always get
 * full ('b2b_b2c'-equivalent) access, matching useSubscription()'s existing
 * admin bypass.
 */
export function usePermissions() {
  const { user, userRole } = useAuth();
  const { subscription, hasActiveSubscription, loading } = useSubscription();

  const tier: Tier = useMemo(() => {
    if (!user) return 'guest';
    if (userRole === 'admin') return 'b2b_b2c';
    if (!hasActiveSubscription || !subscription?.plan) return 'guest';
    return resolveTier(subscription.plan.plan_type, subscription.plan.business_category);
  }, [user, userRole, hasActiveSubscription, subscription]);

  const can = (feature: FeatureKey): AccessLevel => getAccess(tier, feature);
  const isFull = (feature: FeatureKey): boolean => can(feature) === 'full';
  const isBlocked = (feature: FeatureKey): boolean => can(feature) === 'none';

  return {
    tier,
    tierLabel: getTierLabel(tier),
    can,
    isFull,
    isBlocked,
    loading,
    hasActiveSubscription,
    plan: subscription?.plan ?? null,
    planName: subscription?.plan?.name ?? null,
    expiresAt: subscription?.expires_at ?? null,
    creditsPerMonth: subscription?.plan?.credits_per_month ?? null,
    subscriptionId: subscription?.id ?? null,
    invoiceNumber: subscription?.invoice_number ?? null,
  };
}
