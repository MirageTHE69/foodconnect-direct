import { Button } from "@/components/ui/button";
import { Search, Store, Package, Tag, Loader2, ClipboardList, Users, FileCheck2, Handshake, CheckCircle2 } from "lucide-react";
import { PostRfqButton } from "@/components/shared/PostRfqButton";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useVendorNameAccess } from "@/hooks/useVendorNameAccess";
import { maskVendorName } from "@/components/shared/MaskedVendorName";

type SuggestionType = "category" | "sub_category" | "supplier" | "vendor" | "product";

interface Suggestion {
  type: SuggestionType;
  id: string;
  label: string;
  to: string;
}

const SUGGESTION_GROUPS: { label: string; types: SuggestionType[] }[] = [
  { label: "Categories", types: ["category", "sub_category"] },
  { label: "Suppliers", types: ["supplier", "vendor"] },
  { label: "Products", types: ["product"] },
];

const EXAMPLE_RFQ = [
  ["Product", "Turmeric powder"],
  ["Quantity", "5 MT per month"],
  ["Grade / spec", "Curcumin 3%+, steam sterilised"],
  ["Packaging", "25 kg HDPE bags"],
  ["Certifications", "FSSAI licence"],
  ["Delivery", "Vadodara, Gujarat"],
];

const RFQ_STAGES = [
  { icon: ClipboardList, label: "Requirement shared" },
  { icon: Users, label: "Suppliers matched" },
  { icon: FileCheck2, label: "Quotations compared" },
  { icon: Handshake, label: "Order placed" },
];

const Hero = () => {
  const navigate = useNavigate();
  const { canView: canViewNames } = useVendorNameAccess();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const term = searchQuery.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      const like = `%${term}%`;
      const [categoriesRes, subCategoriesRes, suppliersRes, vendorsRes, productsRes] = await Promise.all([
        supabase.from("categories").select("id, slug, name").ilike("name", like).eq("is_active", true).limit(4),
        supabase.from("sub_categories").select("id, slug, name, categories(slug)").ilike("name", like).eq("is_active", true).limit(4),
        supabase.from("supplier_profiles").select("id, company_name").ilike("company_name", like).limit(4),
        supabase.from("directory_vendors").select("id, name, sub_categories(slug, categories(slug))").ilike("name", like).limit(4),
        supabase.from("products").select("id, name").ilike("name", like).eq("status", "approved").limit(4),
      ]);

      // Ignore stale responses from an earlier, slower keystroke.
      if (requestId !== requestIdRef.current) return;

      const results: Suggestion[] = [
        ...(categoriesRes.data || []).map((c) => ({
          type: "category" as const, id: c.id, label: c.name, to: `/categories/${c.slug}`,
        })),
        ...(subCategoriesRes.data || [])
          .filter((s) => s.categories?.slug)
          .map((s) => ({
            type: "sub_category" as const, id: s.id, label: s.name,
            to: `/categories/${s.categories!.slug}/sub/${s.slug}`,
          })),
        ...(suppliersRes.data || []).map((s) => ({
          type: "supplier" as const, id: s.id, label: s.company_name, to: `/suppliers/${s.id}`,
        })),
        ...(vendorsRes.data || [])
          .filter((v) => v.sub_categories?.categories?.slug)
          .map((v) => ({
            type: "vendor" as const, id: v.id, label: v.name,
            to: `/categories/${v.sub_categories!.categories!.slug}/sub/${v.sub_categories!.slug}`,
          })),
        ...(productsRes.data || []).map((p) => ({
          type: "product" as const, id: p.id, label: p.name, to: `/products/${p.id}`,
        })),
      ];
      setSuggestions(results);
      setSearching(false);
    }, 200);
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

  return (
    <section id="hero" className="relative flex items-center pt-28 pb-20 md:pt-36 md:pb-28 bg-mesh overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="blob w-80 h-80 bg-primary/25 -top-16 right-[8%]" />
      <div className="blob w-72 h-72 bg-brand-orange/25 bottom-0 left-[2%]" style={{ animationDelay: "-6s" }} />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-xl">
            <p className="eyebrow mb-6 hero-in">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-brand-orange" />
              </span>
              Foodadda – Sourcing Simplified
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-[4.1rem] font-extrabold leading-[1.05] mb-6 text-foreground hero-in" style={{ animationDelay: "80ms" }}>
              Find the Right Food Suppliers.{" "}
              <span className="text-gradient-brand">Build Better Business.</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 hero-in" style={{ animationDelay: "160ms" }}>
              Connect with manufacturers, suppliers, buyers and distributors across India's food
              industry. From raw materials and ingredients to processing, packaging, branding and
              distribution, make sourcing simpler with Foodadda.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8 hero-in" style={{ animationDelay: "240ms" }}>
              <PostRfqButton className="h-14" />
              <Button variant="outline" size="lg" className="h-14 rounded-xl border-2 border-secondary bg-white/60 backdrop-blur text-secondary font-semibold hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 hover:-translate-y-0.5" onClick={() => navigate("/auth?tab=signup")}>
                Join as a Supplier
              </Button>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={(e) => { e.preventDefault(); runSearch(); }}
              className="flex items-center gap-2 mb-8 relative glass rounded-2xl p-2 shadow-[0_20px_40px_-20px_hsl(209_52%_19%/0.3)] hero-in" style={{ animationDelay: "320ms" }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="What product or ingredient are you looking for? e.g. turmeric powder, 5 MT per month"
                  aria-label="Search products, ingredients and suppliers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-transparent bg-white/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm sm:text-base transition-colors"
                />

                {showSuggestions && (searching || suggestions.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-20 max-h-96 overflow-y-auto">
                    {searching && suggestions.length === 0 ? (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                      </div>
                    ) : (
                      SUGGESTION_GROUPS.map(({ label, types }) => {
                        const items = suggestions.filter((s) => types.includes(s.type));
                        if (items.length === 0) return null;
                        return (
                          <div key={label}>
                            <div className="px-4 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                              {label}
                            </div>
                            {items.map((s) => (
                              <button
                                key={`${s.type}-${s.id}`}
                                type="button"
                                onClick={() => { setShowSuggestions(false); navigate(s.to); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors"
                              >
                                {s.type === "supplier" || s.type === "vendor" ? (
                                  <Store className="w-4 h-4 text-muted-foreground shrink-0" />
                                ) : s.type === "category" || s.type === "sub_category" ? (
                                  <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                                ) : (
                                  <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                                )}
                                <span className="truncate">
                                  {s.type === "vendor" && !canViewNames ? maskVendorName(s.label) : s.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              <Button type="submit" variant="secondary" size="lg" className="h-12 px-5 rounded-xl" aria-label="Search">
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </form>

            {/* What buyers get */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground hero-in" style={{ animationDelay: "400ms" }}>
              {["Free to post a requirement", "No paid membership to enquire", "Human-assisted sourcing desk"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: how an RFQ moves */}
          <div className="relative hidden lg:block hero-in" style={{ animationDelay: "300ms" }}>
            <div className="glass rounded-3xl p-8 shadow-[0_40px_80px_-30px_hsl(209_52%_19%/0.4)] animate-float-slow">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Example requirement</p>
                <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1">RFQ</span>
              </div>
              <dl className="divide-y divide-border mb-6">
                {EXAMPLE_RFQ.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium text-heading text-right">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="grid grid-cols-4 gap-2">
                {RFQ_STAGES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -left-12 top-24 glass rounded-2xl px-4 py-3 shadow-card flex items-center gap-3 animate-float-slow" style={{ animationDelay: "-2s" }}>
              <div className="icon-tile w-9 h-9"><FileCheck2 className="w-4 h-4" /></div>
              <div>
                <p className="text-[11px] text-muted-foreground">Price · MOQ · Lead time</p>
                <p className="text-sm font-semibold text-heading">Quotations compared</p>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-10 glass rounded-2xl px-4 py-3 shadow-card flex items-center gap-3 animate-float-slow" style={{ animationDelay: "-4s" }}>
              <div className="icon-tile w-9 h-9" style={{ background: "linear-gradient(135deg, hsl(28 85% 52%), hsl(38 92% 60%))" }}><Handshake className="w-4 h-4" /></div>
              <div>
                <p className="text-[11px] text-muted-foreground">Samples to orders</p>
                <p className="text-sm font-semibold text-heading">Build business</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
