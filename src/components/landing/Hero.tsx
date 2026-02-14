import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Wheat, Coffee, Fish, Apple, Milk, Flame, Package, LeafyGreen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const floatingIcons = [
  { icon: Wheat, label: "Grains", bg: "bg-primary/15", text: "text-primary", size: "w-16 h-16", top: "top-4", left: "left-8", delay: "0s" },
  { icon: Coffee, label: "Beverages", bg: "bg-accent/15", text: "text-accent", size: "w-20 h-20", top: "top-2", left: "left-[45%]", delay: "1s" },
  { icon: Fish, label: "Seafood", bg: "bg-secondary/10", text: "text-secondary", size: "w-14 h-14", top: "top-[15%]", left: "right-6", delay: "2s" },
  { icon: Apple, label: "Fruits", bg: "bg-destructive/10", text: "text-destructive", size: "w-18 h-18", top: "top-[35%]", left: "left-2", delay: "0.5s" },
  { icon: Milk, label: "Dairy", bg: "bg-primary/20", text: "text-primary", size: "w-16 h-16", top: "top-[40%]", left: "left-[55%]", delay: "1.5s" },
  { icon: Flame, label: "Spices", bg: "bg-accent/20", text: "text-accent", size: "w-14 h-14", top: "top-[55%]", left: "left-[25%]", delay: "2.5s" },
  { icon: Package, label: "Packaged", bg: "bg-muted", text: "text-muted-foreground", size: "w-16 h-16", top: "top-[65%]", left: "right-12", delay: "0.8s" },
  { icon: LeafyGreen, label: "Organic", bg: "bg-primary/10", text: "text-primary", size: "w-14 h-14", top: "top-[80%]", left: "left-[40%]", delay: "1.8s" },
];

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

          {/* Right Visual - Illustration Style */}
          <div className="relative hidden lg:flex justify-center items-center min-h-[500px]">
            {/* Decorative background shapes */}
            <div className="absolute w-64 h-64 rounded-full bg-primary/5 top-10 left-10" />
            <div className="absolute w-40 h-40 rounded-full bg-accent/5 bottom-16 right-8" />
            <div className="absolute w-20 h-20 rounded-2xl bg-primary/10 top-4 right-20 rotate-12" />
            <div className="absolute w-12 h-12 rounded-xl bg-accent/15 bottom-24 left-4 -rotate-12" />

            {/* Floating icon cards */}
            {floatingIcons.map(({ icon: Icon, label, bg, text, size, top, left, delay }, i) => (
              <div
                key={i}
                className={`absolute ${top} ${left} animate-float`}
                style={{ animationDelay: delay, animationDuration: `${5 + i * 0.7}s` }}
              >
                <div className={`${size} ${bg} rounded-2xl shadow-card flex flex-col items-center justify-center gap-1 backdrop-blur-sm border border-border/30 hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${text}`} />
                  <span className={`text-[10px] font-semibold ${text} opacity-70`}>{label}</span>
                </div>
              </div>
            ))}

            {/* Decorative dots */}
            <div className="absolute top-[30%] right-4 flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
