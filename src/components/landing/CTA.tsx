import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="gradient-warm rounded-3xl p-8 md:p-12 lg:p-16 shadow-hover border border-border/50 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-6 shadow-soft">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>

            {/* Content */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Ready to Transform Your{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Food Business?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of food businesses already connecting on FoodAdda. 
              Whether you're a buyer looking for quality suppliers or a supplier 
              seeking new customers – we've got you covered.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" onClick={() => navigate('/auth')}>
                Start as Buyer
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="secondary" size="xl" onClick={() => navigate('/auth')}>
                Start as Supplier
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Trust note */}
            <p className="mt-8 text-sm text-muted-foreground">
              ✓ Free to join &nbsp;&nbsp; ✓ No hidden fees &nbsp;&nbsp; ✓ Verified businesses only
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
