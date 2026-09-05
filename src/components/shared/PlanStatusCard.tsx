import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { CreditCard, Loader2, Receipt } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Shows the signed-in user's active subscription plan (or "Free/Guest
 * access" if none), their access tier, and monthly credits remaining where
 * applicable. Used on both buyer and supplier profile pages.
 */
export function PlanStatusCard() {
  const { loading, hasActiveSubscription, planName, tierLabel, expiresAt, creditsPerMonth, subscriptionId, invoiceNumber } = usePermissions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Your Plan
        </CardTitle>
        <CardDescription>Your current subscription and access level</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : hasActiveSubscription && planName ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-semibold text-foreground">{planName}</p>
                <p className="text-xs text-muted-foreground">Access tier: {tierLabel}</p>
              </div>
              <Badge className="bg-primary text-primary-foreground">Active</Badge>
            </div>
            {creditsPerMonth != null && (
              <p className="text-sm text-muted-foreground">
                {creditsPerMonth} supplier unlocks / month
              </p>
            )}
            {expiresAt && (
              <p className="text-sm text-muted-foreground">
                Renews / expires {format(new Date(expiresAt), 'dd MMM yyyy')}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/subscribe">Change Plan</Link>
              </Button>
              {invoiceNumber && subscriptionId && (
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link to={`/invoice/${subscriptionId}`}>
                    <Receipt className="h-4 w-4" />
                    View Invoice
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">No active subscription — Guest access only</p>
              <Badge variant="outline">Free</Badge>
            </div>
            <Button asChild size="sm">
              <Link to="/subscribe">View Plans</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
