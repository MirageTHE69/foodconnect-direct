import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Check, Star, Sparkles } from 'lucide-react';
import { useSubscriptionPlans } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

export default function Pricing() {
  const { plans, loading } = useSubscriptionPlans();
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-primary/30 text-primary">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Simple Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get full access to FoodAdda's marketplace. Connect with suppliers, manage enquiries, and grow your business.
          </p>
        </div>

        {/* Cards */}
        <div className={`grid gap-8 max-w-4xl mx-auto ${plans.length === 1 ? 'max-w-lg' : 'md:grid-cols-2'}`}>
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-hover ${
                plan.is_popular
                  ? 'border-2 border-primary shadow-soft scale-[1.02]'
                  : 'border border-border'
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
                  <span className="text-4xl font-extrabold text-foreground">₹{plan.price.toLocaleString('en-IN')}</span>
                  <span className="text-muted-foreground ml-2">/ {plan.duration_months} months</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 italic">*Including 18% GST</p>
                {plan.is_popular && (
                  <p className="text-sm font-semibold text-primary mt-2">
                    🎉 Includes 1 month FREE!
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
                  className="w-full"
                  variant={plan.is_popular ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => navigate(`/auth?plan=${plan.id}`)}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
