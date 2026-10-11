import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { CreditCard, Loader2, Receipt } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Shows the signed-in user's free sign-up month or paid plan, when it ends,
 * and any paid plan lined up to start after the free month. Used on both
 * buyer and supplier profile pages.
 */
export function PlanStatusCard() {
  const {
    loading, hasActiveSubscription, planName, tierLabel, expiresAt, creditsPerMonth, subscriptionId, invoiceNumber,
    isTrial, upcomingPlanName, upcomingStartsAt,
  } = usePermissions();

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
              <Badge className="bg-primary text-primary-foreground">{isTrial ? 'Free month' : 'Active'}</Badge>
            </div>
            {!isTrial && creditsPerMonth != null && (
              <p className="text-sm text-muted-foreground">
                {creditsPerMonth} supplier unlocks / month
              </p>
            )}
            {expiresAt && (
              <p className="text-sm text-muted-foreground">
                {isTrial ? 'Free month ends' : 'Active until'} {format(new Date(expiresAt), 'dd MMM yyyy')}
              </p>
            )}
            {isTrial && (
              <p className="text-sm text-muted-foreground">
                {upcomingPlanName
                  ? `${upcomingPlanName} starts on ${upcomingStartsAt ? format(new Date(upcomingStartsAt), 'dd MMM yyyy') : 'that date'}.`
                  : 'After that, a paid plan is needed to keep using your account.'}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {isTrial && !upcomingPlanName && (
                <Button asChild size="sm">
                  <Link to="/subscribe">Choose a Plan</Link>
                </Button>
              )}
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
              <p className="text-sm text-muted-foreground">No active plan</p>
              <Badge variant="outline">Inactive</Badge>
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
