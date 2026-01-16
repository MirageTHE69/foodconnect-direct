import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Users, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero pt-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-sm font-medium text-primary">India's Food Industry Network</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Where Food
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Businesses Connect</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Discover trusted suppliers, explore quality products, and connect directly. 
            No middlemen. No commissions. Just real business connections.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl" className="w-full sm:w-auto" onClick={() => navigate('/auth')}>
              I'm a Buyer
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="hero-outline" size="xl" className="w-full sm:w-auto" onClick={() => navigate('/auth')}>
              I'm a Supplier
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Verified Suppliers</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 mb-3">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">2,000+</p>
              <p className="text-sm text-muted-foreground">Active Buyers</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-3">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">10K+</p>
              <p className="text-sm text-muted-foreground">Connections Made</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
