import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Users, MessageCircle, Utensils, Leaf, Coffee, Wheat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AnimatedCounter = ({ end, suffix = "" }: { end: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [end]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const floatingIcons = [
  { icon: Utensils, position: "top-32 left-[15%]", delay: "0s", size: "w-8 h-8" },
  { icon: Leaf, position: "top-48 right-[20%]", delay: "1s", size: "w-6 h-6" },
  { icon: Coffee, position: "bottom-48 left-[25%]", delay: "2s", size: "w-7 h-7" },
  { icon: Wheat, position: "bottom-32 right-[15%]", delay: "3s", size: "w-8 h-8" },
];

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero pt-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating food icons */}
      {floatingIcons.map((item, index) => (
        <div
          key={index}
          className={`absolute ${item.position} hidden lg:flex items-center justify-center w-14 h-14 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/30 shadow-card animate-float`}
          style={{ animationDelay: item.delay }}
        >
          <item.icon className={`${item.size} text-primary/60`} />
        </div>
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-sm font-medium text-primary">India's #1 Food Industry Network</span>
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
            <Button variant="hero" size="xl" className="w-full sm:w-auto group" onClick={() => navigate('/auth')}>
              I'm a Buyer
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="hero-outline" size="xl" className="w-full sm:w-auto group" onClick={() => navigate('/auth')}>
              I'm a Supplier
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                <AnimatedCounter end={500} suffix="+" />
              </p>
              <p className="text-sm text-muted-foreground">Verified Suppliers</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                <AnimatedCounter end={2000} suffix="+" />
              </p>
              <p className="text-sm text-muted-foreground">Active Buyers</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                <AnimatedCounter end={10} suffix="K+" />
              </p>
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
