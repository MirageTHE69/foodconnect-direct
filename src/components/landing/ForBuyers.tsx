import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  MessageSquare, 
  Heart,
  Filter,
  Bell,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const benefits = [
  {
    icon: Search,
    title: "Easy Discovery",
    description: "Find exactly what you need with powerful search and smart filters across categories.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Suppliers",
    description: "Every supplier is vetted for quality, certifications, and business authenticity.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Chat directly with suppliers. No middlemen, no commission, no hidden fees.",
  },
  {
    icon: Heart,
    title: "Save Favorites",
    description: "Bookmark products and suppliers for quick access. Build your trusted network.",
  },
];

const features = [
  { icon: Filter, text: "Advanced Filters" },
  { icon: Bell, text: "Price Alerts" },
  { icon: FileText, text: "Digital Catalogues" },
  { icon: ShieldCheck, text: "FSSAI Verified" },
];

const ForBuyers = () => {
  const navigate = useNavigate();

  return (
    <section id="for-buyers" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              For Buyers
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Source Smarter,{" "}
              <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Grow Faster
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you run a restaurant, hotel, catering service, or retail store — 
              find the right suppliers for your business in minutes, not weeks.
            </p>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg" onClick={() => navigate('/auth')}>
              Start Sourcing
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            {/* Main card */}
            <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center">
                  <Search className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold">Find Suppliers</h4>
                  <p className="text-sm text-muted-foreground">Search by category, location, or product</p>
                </div>
              </div>

              {/* Search preview */}
              <div className="bg-muted rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Search className="w-5 h-5" />
                  <span className="text-sm">Search "organic spices Kerala"</span>
                </div>
              </div>

              {/* Mock results */}
              <div className="space-y-3">
                {["Spice Masters Kerala", "Kerala Organic Farms", "South Spice Traders"].map((name, i) => (
                  <div key={name} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                        {["🌶️", "🌿", "🧄"][i]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">Verified Supplier</p>
                      </div>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating features */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
              {features.map((feature) => (
                <div 
                  key={feature.text}
                  className="bg-card px-4 py-2 rounded-full border border-border/50 shadow-card flex items-center gap-2"
                >
                  <feature.icon className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-medium whitespace-nowrap">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Background decoration */}
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForBuyers;
