import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription, useSubscriptionPlans, SubscriptionPlan } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { startRazorpayCheckout } from '@/hooks/useRazorpayCheckout';
import { useSubscriptionActivationWatcher } from '@/hooks/useSubscriptionActivationWatcher';
import { Check, Star, Loader2, ArrowLeft, Utensils, PartyPopper, CalendarCheck } from 'lucide-react';

export default function Subscribe() {
  const { plans, loading: plansLoading } = useSubscriptionPlans();
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activatedPlan, setActivatedPlan] = useState<SubscriptionPlan | null>(null);
  const [isPaidActivation, setIsPaidActivation] = useState(false);
  const [pendingSubscription, setPendingSubscription] = useState<{ plan?: SubscriptionPlan } | null>(null);
  const [checkingPending, setCheckingPending] = useState(true);
  const [showProcessing, setShowProcessing] = useState(false);
  const [pendingActivationId, setPendingActivationId] = useState<string | null>(null);

  useSubscriptionActivationWatcher(pendingActivationId, () => {
    setShowProcessing(false);
    setPendingActivationId(null);
    setIsPaidActivation(true);
    setShowSuccess(true);
  });

  useEffect(() => {
    if (!subscriptionLoading && hasActiveSubscription && !showSuccess) {
      navigate('/dashboard', { replace: true });
    }
  }, [hasActiveSubscription, subscriptionLoading, navigate, showSuccess]);

  useEffect(() => {
    if (!user || plansLoading) return;
    (async () => {
      const { data } = await supabase
        .from('user_subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'pending_payment')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setPendingSubscription(data ? { plan: (data as any).plan } : null);
      setCheckingPending(false);
    })();
  }, [user, plansLoading]);

  const handleSubscribe = async () => {
    if (!selectedPlan || !user) return;

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    const price = billingCycle === 'annual' ? plan.price_annual : plan.price_monthly;
    const isFree = plan.plan_type === 'free' || price === 0;

    setIsSubmitting(true);
    try {
      if (isFree) {
        const { error } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            plan_id: plan.id,
            billing_cycle: billingCycle,
          });

        if (error) throw error;

        setActivatedPlan(plan);
        setIsPaidActivation(false);
        setShowSuccess(true);
        return;
      }

      const { result, subscriptionId } = await startRazorpayCheckout(plan.id, billingCycle);
      if (result.error) throw new Error(result.error.message || 'Payment was not completed.');

      setActivatedPlan(plan);
      setPendingActivationId(subscriptionId);
      setShowProcessing(true);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to submit subscription request.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlanObj = plans.find(p => p.id === selectedPlan);
  const selectedPlanIsFree = !selectedPlanObj
    || selectedPlanObj.plan_type === 'free'
    || (billingCycle === 'annual' ? selectedPlanObj.price_annual : selectedPlanObj.price_monthly) === 0;

  const handleGoToDashboard = () => {
    setShowSuccess(false);
    navigate('/dashboard', { replace: true, state: { freshSubscription: true } });
  };

  if (plansLoading || checkingPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pendingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="items-center pt-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <CalendarCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Request Pending Review</h1>
          </CardHeader>
          <CardContent className="pb-8 space-y-4">
            <p className="text-muted-foreground">
              Your request for <span className="font-semibold text-foreground">{pendingSubscription.plan?.name}</span>{' '}
              is awaiting admin approval. We'll activate it as soon as payment is confirmed.
            </p>
            <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full">
              Go to Dashboard →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              This usually takes just a few seconds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              variant="ghost"
              onClick={() => { setShowProcessing(false); navigate('/dashboard', { replace: true }); }}
            >
              Go to Dashboard →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md text-center" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <PartyPopper className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl">{isPaidActivation ? 'Payment Successful!' : 'Request Submitted!'}</DialogTitle>
            <DialogDescription className="text-base mt-2">
              {isPaidActivation
                ? 'Your plan is now active.'
                : 'Your plan request has been sent for admin approval.'}
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
                {isPaidActivation
                  ? 'You now have full access to everything included in this plan.'
                  : 'An admin will confirm your payment and activate this plan shortly. You can keep using FoodAdda on your current access level in the meantime.'}
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
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
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          Skip for now
        </Button>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Utensils className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              Food<span className="text-primary">Adda</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Upgrade Your Plan</h1>
          <p className="text-muted-foreground">Select a subscription plan for full access to the platform.</p>
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
                {cycle === 'annual' ? 'Annual (1 month free)' : 'Monthly (1 month free)'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.price_annual : plan.price_monthly;
            const isFree = plan.plan_type === 'free' || price === 0;
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
                    {isFree ? (
                      <span className="text-4xl font-extrabold text-foreground">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold text-foreground">₹{price.toLocaleString('en-IN')}</span>
                        <span className="text-muted-foreground ml-2">
                          / {billingCycle === 'annual' ? '13 months' : 'month'}
                        </span>
                      </>
                    )}
                  </div>
                  {!isFree && <p className="text-xs text-muted-foreground mt-1 italic">Inclusive of all taxes</p>}
                  {!isFree && (
                    <p className="text-sm font-semibold text-primary mt-2">
                      🎉 1 month FREE {billingCycle === 'annual' ? '— 13 months access' : '— 2 months access'}
                    </p>
                  )}
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
            disabled={!selectedPlan || isSubmitting}
            onClick={handleSubscribe}
            className="px-12"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {selectedPlanIsFree ? 'Submitting...' : 'Redirecting to payment...'}
              </>
            ) : selectedPlanIsFree ? (
              'Request This Plan'
            ) : (
              'Proceed to Payment'
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            {selectedPlanIsFree
              ? 'An admin will confirm payment and activate your plan. No card details needed yet.'
              : 'Pay securely with Razorpay — your plan activates instantly after payment.'}
          </p>
        </div>
      </div>
    </div>
  );
}