import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionPlans } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, Star, Loader2, ArrowLeft, Utensils } from 'lucide-react';

export default function Subscribe() {
  const { plans, loading: plansLoading } = useSubscriptionPlans();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      toast({ title: 'Subscription Activated!', description: `You now have access for ${plan.duration_months} months.` });
      navigate('/dashboard', { replace: true, state: { freshSubscription: true } });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to activate subscription.' });
    } finally {
      setIsSubmitting(false);
    }
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
