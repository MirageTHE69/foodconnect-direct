import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 bg-background overflow-hidden">
      {/* Yellow diagonal accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 skew-x-[-6deg] translate-x-20 hidden lg:block" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-foreground">
              India's first{" "}
              <span className="bg-primary text-primary-foreground px-2 inline-block -skew-x-2">
                business platform
              </span>{" "}
              built exclusively for the food industry.
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Discover trusted suppliers, explore quality products, and connect directly. 
              No middlemen. No commissions.
            </p>

            {/* Search Bar */}
            <div className="flex items-center gap-2 mb-8">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search suppliers, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <Button 
                variant="hero" 
                size="lg" 
                className="h-14"
                onClick={() => navigate('/suppliers')}
              >
                Find Suppliers
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[hsl(145,63%,49%)]" />
                500+ Verified Suppliers
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                50+ Cities
              </span>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:flex justify-center items-center">
            {/* Phone mockup */}
            <div className="relative w-72 h-[520px] rounded-[40px] border-[8px] border-secondary bg-card shadow-hover overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-secondary rounded-b-2xl" />
              <div className="p-4 pt-10 h-full flex flex-col">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-3 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-2xl">F</span>
                  </div>
                  <p className="font-bold text-foreground text-sm">FoodAdda</p>
                  <p className="text-xs text-muted-foreground">Your Food Business Network</p>
                </div>
                
                <div className="space-y-3 flex-1">
                  {["🌾 Grains & Cereals", "🥛 Dairy Products", "🌶️ Spices", "🍎 Fresh Produce", "🥩 Meat & Poultry"].map((item) => (
                    <div key={item} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border/50">
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating yellow accent shapes */}
            <div className="absolute -top-8 -right-4 w-24 h-24 bg-primary rounded-2xl -rotate-12 opacity-20" />
            <div className="absolute -bottom-6 -left-8 w-16 h-16 bg-accent rounded-xl rotate-12 opacity-30" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
