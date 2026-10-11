import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription, useSubscriptionPlans, SubscriptionPlan } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { startRazorpayCheckout } from '@/hooks/useRazorpayCheckout';
import { useSubscriptionActivationWatcher } from '@/hooks/useSubscriptionActivationWatcher';
import { INDIAN_STATES } from '@/lib/gst';
import { format } from 'date-fns';
import { Check, Star, Loader2, ArrowLeft, Utensils, PartyPopper, CalendarCheck, Receipt, Clock, Lock, LogOut } from 'lucide-react';

export default function Subscribe() {
  const { plans, loading: plansLoading } = useSubscriptionPlans();
  const { subscription, upcoming, isTrial, hasActiveSubscription, loading: subscriptionLoading, refetch } = useSubscription();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [billingState, setBillingState] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activatedPlan, setActivatedPlan] = useState<SubscriptionPlan | null>(null);
  const [activatedSubscriptionId, setActivatedSubscriptionId] = useState<string | null>(null);
  // When bought during the free month, the plan starts when that month ends.
  const [planStartsAt, setPlanStartsAt] = useState<string | null>(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const [pendingActivationId, setPendingActivationId] = useState<string | null>(null);
  const [processingSlow, setProcessingSlow] = useState(false);

  // The plan is activated by Razorpay's server-to-server confirmation. If that
  // is slow, let the user out of the waiting dialog instead of trapping them.
  useEffect(() => {
    if (!showProcessing) {
      setProcessingSlow(false);
      return;
    }
    const t = setTimeout(() => setProcessingSlow(true), 45000);
    return () => clearTimeout(t);
  }, [showProcessing]);

  const handleActivated = useCallback(() => {
    setShowProcessing(false);
    setPendingActivationId(null);
    setShowSuccess(true);
    refetch();
  }, [refetch]);

  useSubscriptionActivationWatcher(pendingActivationId, handleActivated);

  // Nothing to buy if they're already on a paid plan, or have one lined up
  // to start after the free month.
  const alreadyCovered = (hasActiveSubscription && !isTrial) || !!upcoming;
  useEffect(() => {
    if (!subscriptionLoading && alreadyCovered && !showSuccess && !showProcessing) {
      navigate('/dashboard', { replace: true });
    }
  }, [alreadyCovered, subscriptionLoading, navigate, showSuccess, showProcessing]);

  const handleSubscribe = async () => {
    if (!selectedPlan || !user || !billingState) return;

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    setIsSubmitting(true);
    try {
      const { result, subscriptionId } = await startRazorpayCheckout(plan.id, billingCycle, billingState);
      if (result.error) throw new Error(result.error.message || 'Payment was not completed.');

      setActivatedPlan(plan);
      setActivatedSubscriptionId(subscriptionId);
      setPlanStartsAt(isTrial && subscription ? subscription.expires_at : null);
      setPendingActivationId(subscriptionId);
      setShowProcessing(true);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Payment not completed', description: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    setShowSuccess(false);
    navigate('/dashboard', { replace: true });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const trialEnds = isTrial && subscription ? format(new Date(subscription.expires_at), 'dd MMM yyyy') : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Processing Dialog (Razorpay payment completed client-side, waiting on webhook activation) */}
      <Dialog open={showProcessing} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md text-center" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <DialogTitle className="text-2xl">Confirming your payment…</DialogTitle>
            <DialogDescription className="text-base mt-2">
              {processingSlow
                ? 'This is taking longer than usual. If the payment went through, your plan will activate on its own within a few minutes. If it does not, email info@foodadda.in with your payment details.'
                : 'This usually takes just a few seconds. Please keep this page open.'}
            </DialogDescription>
          </DialogHeader>
          {processingSlow && (
            <DialogFooter className="sm:justify-center">
              <Button variant="outline" onClick={() => { setShowProcessing(false); setPendingActivationId(null); refetch(); }}>
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md text-center" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <PartyPopper className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Payment Successful!</DialogTitle>
            <DialogDescription className="text-base mt-2">
              {planStartsAt ? 'Your plan is booked.' : 'Your plan is now active.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-semibold text-foreground">{activatedPlan?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Billing</span>
                <span className="font-semibold text-foreground">{billingCycle === 'annual' ? 'Annual' : 'Monthly'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
              <CalendarCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground text-left">
                {planStartsAt
                  ? `Your free month continues until ${format(new Date(planStartsAt), 'dd MMM yyyy')}. This plan starts on that date, so you keep every free day.`
                  : 'You now have access to everything included in this plan.'}
              </p>
            </div>
          </div>
          <DialogFooter className="sm:flex-col sm:justify-center gap-2">
            {activatedSubscriptionId && (
              <Button asChild variant="outline" size="lg" className="w-full gap-2">
                <Link to={`/invoice/${activatedSubscriptionId}`}>
                  <Receipt className="w-4 h-4" />
                  View Invoice
                </Link>
              </Button>
            )}
            <Button onClick={handleGoToDashboard} size="lg" className="w-full">
              Go to Dashboard →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        {hasActiveSubscription ? (
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        ) : (
          <Button variant="ghost" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        )}
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Utensils className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              Food<span className="text-primary">Adda</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">Pick a monthly or annual plan to keep using FoodAdda.</p>
        </div>

        <div className="max-w-2xl mx-auto mb-8 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          {trialEnds ? (
            <>
              <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-semibold">Your free month runs until {trialEnds}.</span>{' '}
                You can pick a plan now. It starts on that date, so you keep every free day.
              </p>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-semibold">Your free month has ended.</span>{' '}
                Choose a plan to open your dashboard, vendor details, messages and saved items again.
              </p>
            </>
          )}
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-border p-1">
            {(['monthly', 'annual'] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === cycle ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {cycle === 'annual' ? 'Annual' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-xs mx-auto mb-8">
          <Label htmlFor="billing-state" className="text-sm font-medium mb-1.5 block">
            Billing State <span className="text-destructive">*</span>
          </Label>
          <Select value={billingState} onValueChange={setBillingState}>
            <SelectTrigger id="billing-state">
              <SelectValue placeholder="Select your billing state" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1.5">
            Used to calculate GST (CGST+SGST or IGST) on your invoice.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.price_annual : plan.price_monthly;
            return (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'border-2 border-primary shadow-soft ring-2 ring-primary/20'
                    : plan.is_popular
                    ? 'border-2 border-primary/40 shadow-soft'
                    : 'border border-border hover:border-primary/30'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.is_popular && (
                  <div className="absolute top-0 right-0">
                    <div className="gradient-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      BEST VALUE
                    </div>
                  </div>
                )}
                <CardHeader className="pb-2 pt-8">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-foreground">₹{price.toLocaleString('en-IN')}</span>
                    <span className="text-muted-foreground ml-2">/ {billingCycle === 'annual' ? 'year' : 'month'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 italic">Inclusive of all taxes</p>
                  {plan.credits_per_month && (
                    <p className="text-sm font-medium text-foreground mt-2">
                      {plan.credits_per_month} supplier unlocks / month
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-2 pb-6">
                  <Badge variant={selectedPlan === plan.id ? 'default' : 'outline'} className="w-full justify-center py-2">
                    {selectedPlan === plan.id ? '✓ Selected' : 'Click to Select'}
                  </Badge>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button
            size="lg"
            disabled={!selectedPlan || !billingState || isSubmitting}
            onClick={handleSubscribe}
            className="px-12"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening payment...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            {!selectedPlan
              ? 'Select a plan above to continue.'
              : !billingState
              ? 'Select your billing state above to continue.'
              : trialEnds
              ? `Pay securely with Razorpay. Your plan starts on ${trialEnds}.`
              : 'Pay securely with Razorpay. Your plan activates instantly after payment.'}
          </p>
        </div>
      </div>
    </div>
  );
}
