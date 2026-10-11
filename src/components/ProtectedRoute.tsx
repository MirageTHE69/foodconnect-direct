import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('buyer' | 'supplier' | 'admin')[];
  /** Set false for pages a lapsed user must still reach (plans, invoices). */
  requireSubscription?: boolean;
}

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

// Signed-in pages need an active plan or the free sign-up month. Once that
// lapses, everything here redirects to /subscribe until the user pays.
// Admins are exempt (useSubscription always reports them as active).
export function ProtectedRoute({ children, allowedRoles, requireSubscription = true }: ProtectedRouteProps) {
  const { user, userRole, allRoles, loading, rolesLoading } = useAuth();
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription();

  if (loading) return <FullPageSpinner />;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Wait for the roles fetch to actually be in flight -- allRoles.length === 0
  // alone can't distinguish "still loading" from "loaded and genuinely empty",
  // which used to leave roleless accounts stuck on this spinner forever.
  if (rolesLoading) return <FullPageSpinner />;

  // Check if user has any of the allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allRoles.some(role => allowedRoles.includes(role));
    if (!hasAllowedRole) {
      if (userRole === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (requireSubscription) {
    if (subscriptionLoading) return <FullPageSpinner />;
    if (!hasActiveSubscription) return <Navigate to="/subscribe" replace />;
  }

  return <>{children}</>;
}
