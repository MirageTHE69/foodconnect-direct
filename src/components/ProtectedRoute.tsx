import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('buyer' | 'supplier' | 'admin')[];
}

// Route-level gating is auth + role only. Subscription tier (Free Registered
// vs Paid Business) no longer blocks access to the app at the route level —
// Free Registered is a real, usable tier under the new subscription model.
// Feature-level gating happens inside individual pages instead.
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userRole, allRoles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Wait for roles to be fetched if user exists but roles aren't loaded yet
  if (user && allRoles.length === 0 && !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

  return <>{children}</>;
}
