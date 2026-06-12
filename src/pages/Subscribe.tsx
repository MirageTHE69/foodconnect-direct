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
import { Check, Star, Loader2, ArrowLeft, Utensils, PartyPopper, CalendarCheck } from 'lucide-react';

export default function Subscribe() {
  const { plans, loading: plansLoading } = useSubscriptionPlans();
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activatedPlan, setActivatedPlan] = useState<SubscriptionPlan | null>(null);
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    if (!subscriptionLoading && hasActiveSubscription && !showSuccess) {
      navigate('/dashboard', { replace: true });
    }
  }, [hasActiveSubscription, subscriptionLoading, navigate, showSuccess]);

  const handleSubscribe = async () => {
    if (!selectedPlan || !user) return;

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    setIsSubmitting(true);
    try {
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + plan.duration_months);

      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          status: 'active',
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          payment_status: 'free_trial',
        });

      if (error) throw error;

      setActivatedPlan(plan);
      setExpiryDate(expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }));
      setShowSuccess(true);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to activate subscription.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    setShowSuccess(false);
    navigate('/dashboard', { replace: true, state: { freshSubscription: true } });
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md text-center" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <PartyPopper className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl">🎉 Subscription Activated!</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Welcome to FoodAdda! Your membership is now active.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-semibold text-foreground">{activatedPlan?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-semibold text-foreground">{activatedPlan?.duration_months} months</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Free until</span>
                <span className="font-semibold text-primary">{expiryDate}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
              <CalendarCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground text-left">
                You have <span className="font-semibold text-foreground">{activatedPlan?.duration_months} months free membership</span>. Payment will be required after <span className="font-semibold text-foreground">{expiryDate}</span>.
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

      <header className="p-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose a Plan to Continue</h1>
          <p className="text-muted-foreground">Select a subscription plan to access the platform.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
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
                  <span className="text-4xl font-extrabold text-foreground">₹{plan.price.toLocaleString('en-IN')}</span>
                  <span className="text-muted-foreground ml-2">/ {plan.duration_months} months</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 italic">Inclusive of all taxes</p>
                {plan.is_popular && (
                  <p className="text-sm font-semibold text-primary mt-2">🎉 Includes 2 months FREE!</p>
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
          ))}
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
                Activating...
              </>
            ) : (
              'Start Free Trial'
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Payment gateway integration coming soon. Currently activating as free trial.
          </p>
        </div>
      </div>
    </div>
  );
}