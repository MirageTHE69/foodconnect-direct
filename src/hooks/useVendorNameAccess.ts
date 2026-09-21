import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Directory vendor names are only revealed to signed-in users with an active
 * subscription (admins always qualify). Defaults to hidden while auth or
 * subscription state is still loading so real names never flash first.
 */
export function useVendorNameAccess() {
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subLoading } = usePermissions();

  const loading = authLoading || subLoading;
  const canView = !loading && !!user && hasActiveSubscription;
  const reason: 'guest' | 'unsubscribed' | null = canView ? null : user ? 'unsubscribed' : 'guest';

  return { canView, loading, reason };
}
