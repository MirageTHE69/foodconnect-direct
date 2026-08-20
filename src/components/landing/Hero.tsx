import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Store, Package, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

import poster1 from "@/assets/posters/poster-1.jpg";
import poster3 from "@/assets/posters/poster-3.jpg";

const posters = [poster1, poster3];

interface Suggestion {
  type: "supplier" | "product" | "category";
  id: string;
  slug?: string;
  label: string;
}

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const term = searchQuery.trim();
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const [suppliersRes, productsRes, categoriesRes] = await Promise.all([
        supabase.from("supplier_profiles").select("id, company_name").ilike("company_name", `%${term}%`).limit(3),
        supabase.from("products").select("id, name").ilike("name", `%${term}%`).eq("status", "approved").limit(3),
        supabase.from("categories").select("id, slug, name").ilike("name", `%${term}%`).eq("is_active", true).limit(3),
      ]);
      const results: Suggestion[] = [
        ...(categoriesRes.data || []).map((c) => ({ type: "category" as const, id: c.id, slug: c.slug, label: c.name })),
        ...(suppliersRes.data || []).map((s) => ({ type: "supplier" as const, id: s.id, label: s.company_name })),
        ...(productsRes.data || []).map((p) => ({ type: "product" as const, id: p.id, label: p.name })),
      ];
      setSuggestions(results);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const runSearch = () => {
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/suppliers");
    }
  };

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveSlide(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide((activeSlide + 1) % posters.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeSlide, goToSlide]);

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center pt-20 bg-background overflow-hidden">
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
            <form
              onSubmit={(e) => { e.preventDefault(); runSearch(); }}
              className="flex items-center gap-2 mb-8 relative"
            >
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search suppliers, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20">
                    {suggestions.map((s) => (
                      <button
                        key={`${s.type}-${s.id}`}
                        type="button"
                        onClick={() => navigate(
                          s.type === "supplier" ? `/suppliers/${s.id}`
                          : s.type === "category" ? `/categories/${s.slug}`
                          : `/products/${s.id}`
                        )}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors"
                      >
                        {s.type === "supplier" ? (
                          <Store className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : s.type === "category" ? (
                          <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="truncate">{s.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="h-14"
              >
                Find Suppliers
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

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

          {/* Right Visual - Phone Mockup with Auto-Rotating Posters */}
          <div className="relative hidden lg:flex justify-center items-center min-h-[500px]">
            {/* Glow behind phone */}
            <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl" />

            {/* Phone Frame */}
            <div className="relative w-[280px] h-[570px] rounded-[3rem] border-[6px] border-foreground/90 bg-foreground/95 shadow-2xl overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground/95 rounded-b-2xl z-20" />

              {/* Screen Content - Poster Carousel */}
              <div className="relative w-full h-full overflow-hidden rounded-[2.5rem]">
                {posters.map((poster, index) => (
                  <div
                    key={index}
                    className="absolute inset-0 transition-all duration-600 ease-in-out"
                    style={{
                      opacity: activeSlide === index ? 1 : 0,
                      transform: activeSlide === index ? 'scale(1)' : 'scale(1.05)',
                      transition: 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out',
                    }}
                  >
                    <img
                      src={poster}
                      alt={`FoodAdda promotional poster ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {posters.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeSlide === index
                          ? 'w-6 bg-primary'
                          : 'w-1.5 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/30 z-20" />
            </div>

            {/* Decorative elements around phone */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-primary/10 rotate-12 animate-float" style={{ animationDuration: '6s' }} />
            <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-accent/10 animate-float" style={{ animationDuration: '7s', animationDelay: '1s' }} />
            <div className="absolute top-1/4 -left-8 w-12 h-12 rounded-xl bg-primary/15 -rotate-12 animate-float" style={{ animationDuration: '5s', animationDelay: '2s' }} />

            {/* Decorative dots */}
            <div className="absolute top-[30%] -right-2 flex flex-col gap-2">
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
