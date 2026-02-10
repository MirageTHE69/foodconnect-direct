import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, MapPin, Star, Award, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const reputationConfig = {
  premium: { label: "Premium", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  established: { label: "Established", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  emerging: { label: "Emerging", className: "bg-green-500/10 text-green-600 border-green-500/20" },
};

const FeaturedSuppliers = () => {
  const navigate = useNavigate();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['featured-suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_profiles')
        .select('id, company_name, city, state, logo_url, specialty, market_reputation, reputation_score, is_featured, verification_status')
        .eq('is_featured', true)
        .eq('verification_status', 'verified')
        .order('reputation_score', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Get product counts
      const supplierIds = data?.map(s => s.id) ?? [];
      if (supplierIds.length === 0) return [];

      const { data: products } = await supabase
        .from('products')
        .select('supplier_id')
        .in('supplier_id', supplierIds)
        .eq('status', 'approved');

      const countMap = new Map<string, number>();
      products?.forEach(p => countMap.set(p.supplier_id, (countMap.get(p.supplier_id) ?? 0) + 1));

      return (data ?? []).map(s => ({
        ...s,
        productCount: countMap.get(s.id) ?? 0,
      }));
    },
  });

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            Trusted Partners
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Featured <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Suppliers</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with verified suppliers who have been vetted for quality, reliability, and business excellence.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : suppliers.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Featured suppliers coming soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {suppliers.map((supplier) => {
              const rep = reputationConfig[supplier.market_reputation as keyof typeof reputationConfig] ?? reputationConfig.emerging;
              return (
                <div
                  key={supplier.id}
                  className="group bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/suppliers/${supplier.id}`)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl overflow-hidden">
                      {supplier.logo_url ? (
                        <img src={supplier.logo_url} alt={supplier.company_name} className="w-full h-full object-cover" />
                      ) : (
                        <span>🏪</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {supplier.company_name}
                        </h3>
                        <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                      </div>
                      {supplier.specialty && (
                        <p className="text-sm text-primary font-medium truncate">{supplier.specialty}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="outline" className={rep.className}>
                      <Award className="w-3 h-3 mr-1" />
                      {rep.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {(supplier.city || supplier.state) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{[supplier.city, supplier.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="font-semibold">{supplier.reputation_score ?? 0}</span>
                      <span className="text-xs text-muted-foreground">/ 100</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{supplier.productCount} Products</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center">
          <Button size="lg" variant="outline" onClick={() => navigate('/suppliers')}>
            View All Suppliers
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSuppliers;
