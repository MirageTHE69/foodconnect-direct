import { Button } from "@/components/ui/button";
import { Check, ArrowRight, TrendingUp, Users, Shield, Zap } from "lucide-react";

const benefits = [
  { icon: TrendingUp, text: "Reach thousands of verified food buyers" },
  { icon: Users, text: "Build your brand with a professional profile" },
  { icon: Shield, text: "Showcase certifications (FSSAI, ISO, etc.)" },
  { icon: Zap, text: "Connect directly – no middlemen or commissions" },
];

const features = [
  "Unlimited product listings",
  "Recipe showcase feature",
  "Direct buyer messaging",
  "Business analytics dashboard",
  "Priority search visibility",
  "Verified supplier badge",
];

const ForSuppliers = () => {
  return (
    <section id="for-suppliers" className="py-24 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              For Suppliers
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Grow Your Food Business with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">FoodAdda</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join India's fastest-growing food industry network. Showcase your products, 
              share recipes, and connect with restaurants, hotels, and retailers looking 
              for quality suppliers.
            </p>

            {/* Benefits */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit) => (
                <div key={benefit.text} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-sm font-medium mt-2">{benefit.text}</span>
                </div>
              ))}
            </div>

            <Button variant="secondary" size="lg">
              Register as Supplier
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Right Content - Feature Card */}
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute -inset-4 bg-gradient-to-br from-secondary/20 via-primary/10 to-accent/20 rounded-3xl blur-2xl" />
            
            <div className="relative bg-card rounded-2xl p-8 shadow-hover border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center">
                  <Zap className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Supplier Features</h3>
                  <p className="text-sm text-muted-foreground">Everything you need to succeed</p>
                </div>
              </div>

              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Starting at</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Free</span>
                  <span className="text-muted-foreground">to get started</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForSuppliers;
