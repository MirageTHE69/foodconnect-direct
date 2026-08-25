import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Star, Sparkles, Loader2 } from 'lucide-react';
import { useSubscriptionPlans } from '@/hooks/useSubscription';

const CATEGORY_LABELS: Record<string, string> = {
  founders: 'Founders',
  women_enterprise: 'Women Enterprise',
  north_east_startups: 'North East Startups',
  micro_first_time: 'Micro & First-Time Startups',
  small_homemade_food: 'Small Homemade Food',
};

export default function Pricing() {
  const { plans, loading } = useSubscriptionPlans();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(plans.filter((p) => p.business_category).map((p) => p.business_category as string))
    );
    return cats;
  }, [plans]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const selectedCategory = activeCategory ?? categories[0] ?? null;

  const categoryPlans = plans.filter((p) => p.business_category === selectedCategory);
  const universalPlans = plans.filter((p) => p.plan_type === 'universal_tier');

  if (loading) {
    return (
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const renderPlanCard = (plan: (typeof plans)[number]) => {
    const price = billingCycle === 'annual' ? plan.price_annual : plan.price_monthly;
    const isFree = plan.plan_type === 'free' || price === 0;

    return (
      <Card
        key={plan.id}
        className={`relative overflow-hidden transition-all duration-300 hover:shadow-hover ${
          plan.is_popular ? 'border-2 border-primary shadow-soft scale-[1.02]' : 'border border-border'
        }`}
      >
        {plan.is_popular && (
          <div className="absolute top-0 right-0">
            <div className="gradient-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              MOST POPULAR
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

        <CardFooter className="pt-4 pb-8">
          <Button
            className={plan.is_popular ? 'w-full' : 'w-full text-foreground border-foreground/30 hover:bg-primary hover:text-foreground hover:border-primary'}
            variant={plan.is_popular ? 'default' : 'outline'}
            size="lg"
            onClick={() => navigate(`/auth?planCode=${plan.code}`)}
          >
            Get Started
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <section id="pricing" className="py-20 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-primary/30 text-primary">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Simple Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Choose Your Plan</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get full access to FoodAdda's marketplace. Connect with suppliers, manage enquiries, and grow your
            business.
          </p>
          <p className="mt-4 inline-block text-sm font-semibold text-primary bg-primary/10 rounded-full px-4 py-1.5">
            🎉 Limited-time launch offer: every paid plan includes 1 month free — on monthly or annual billing.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'annual')}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly (1 month free)</TabsTrigger>
              <TabsTrigger value="annual">Annual (1 month free)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Category-credit plans */}
        {categories.length > 0 && (
          <div className="mb-16">
            <h3 className="text-xl font-bold text-center text-foreground mb-6">Category Plans for Suppliers</h3>
            <div className="flex justify-center mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    className={selectedCategory === cat ? '' : 'text-foreground border-foreground/30 hover:bg-primary hover:text-foreground hover:border-primary'}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </Button>
                ))}
              </div>
            </div>
            <div className={`grid gap-8 max-w-4xl mx-auto ${categoryPlans.length === 1 ? 'max-w-lg' : 'md:grid-cols-2'}`}>
              {categoryPlans.map(renderPlanCard)}
            </div>
          </div>
        )}

        {/* Universal tiers */}
        {universalPlans.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-center text-foreground mb-6">Universal Upgrade Tiers</h3>
            <p className="text-center text-sm text-muted-foreground mb-8 max-w-xl mx-auto">
              Category-independent, flat-fee plans with full access — no credit limits.
            </p>
            <div
              className={`grid gap-8 max-w-4xl mx-auto ${
                universalPlans.length === 1 ? 'max-w-lg' : universalPlans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
              }`}
            >
              {universalPlans.map(renderPlanCard)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
