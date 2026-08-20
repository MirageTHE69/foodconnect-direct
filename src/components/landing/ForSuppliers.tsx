import { Button } from "@/components/ui/button";
import { Check, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscriptionPlans } from "@/hooks/useSubscription";
import { useAnchorNav } from "@/hooks/useAnchorNav";

const features = [
  "Unlimited product listings",
  "Recipe showcase feature",
  "Direct buyer messaging",
  "Business analytics dashboard",
  "Priority search visibility",
  "Verified supplier badge",
];

const ForSuppliers = () => {
  const navigate = useNavigate();
  const goToAnchor = useAnchorNav();
  const { plans } = useSubscriptionPlans();
  const paidPlans = plans.filter((p) => p.plan_type !== "free" && p.price_monthly > 0);
  const startingPrice = paidPlans.length > 0 ? Math.min(...paidPlans.map((p) => p.price_monthly)) : null;

  return (
    <section id="for-suppliers" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
              Subscribe to your
            </h2>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-primary text-primary-foreground px-2 -skew-x-1 inline-block">one-stop platform</span>
            </h2>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              for all food industry needs.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Join India's fastest-growing food industry network. Showcase your products, 
              share recipes, and connect with buyers.
            </p>
            <Button variant="hero" size="lg" onClick={() => navigate('/auth')}>
              Get Started as a Supplier
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Right - Pricing Card */}
          <div className="relative">
            <div className="bg-background rounded-3xl p-8 border border-border/50 shadow-hover max-w-sm mx-auto">
              <p className="text-sm text-muted-foreground mb-1">Pricing</p>
              <div className="flex items-baseline gap-2 mb-6">
                {startingPrice !== null ? (
                  <>
                    <span className="text-sm text-muted-foreground">from</span>
                    <span className="text-5xl font-extrabold text-foreground">₹{startingPrice.toLocaleString('en-IN')}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-foreground">See plans below</span>
                )}
              </div>

              <Button variant="hero" className="w-full mb-8" size="lg" onClick={goToAnchor("#pricing")}>
                View Plans
              </Button>

              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Yellow accent behind card */}
            <div className="absolute -top-4 -right-4 w-full h-full rounded-3xl bg-primary/10 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForSuppliers;
