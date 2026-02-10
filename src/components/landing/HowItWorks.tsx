import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Curious about how it{" "}
              <span className="bg-primary text-primary-foreground px-2 -skew-x-1 inline-block">works?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              FoodAdda makes it simple for food industry businesses to find, connect, 
              and build lasting partnerships. Browse suppliers, explore products, and 
              start conversations — all in one platform.
            </p>
            <Button 
              variant="hero" 
              size="lg" 
              onClick={() => navigate('/auth')}
            >
              Learn More
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-card">
              <div className="space-y-6">
                {[
                  { step: "01", title: "Discover", desc: "Browse verified food suppliers across 12+ categories" },
                  { step: "02", title: "Connect", desc: "Chat directly with suppliers — no middlemen" },
                  { step: "03", title: "Grow", desc: "Build lasting business relationships" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold text-sm">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 w-full h-full rounded-3xl border-2 border-primary/20 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
