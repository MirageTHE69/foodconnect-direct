import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, MapPin, Star, Award, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const reputationConfig = {
  premium: { label: "Premium", className: "bg-primary/10 text-primary border-primary/20" },
  established: { label: "Established", className: "bg-accent/10 text-accent border-accent/20" },
  emerging: { label: "Emerging", className: "bg-[hsl(145,63%,49%)]/10 text-[hsl(145,63%,49%)] border-[hsl(145,63%,49%)]/20" },
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
        .limit(4);

      if (error) throw error;

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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Innovative Products
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/suppliers')}>
            View all
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : suppliers.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Featured suppliers coming soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suppliers.map((supplier) => {
              const rep = reputationConfig[supplier.market_reputation as keyof typeof reputationConfig] ?? reputationConfig.emerging;
              return (
                <div
                  key={supplier.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/suppliers/${supplier.id}`)}
                >
                  {/* Image area */}
                  <div className="h-48 bg-muted flex items-center justify-center">
                    {supplier.logo_url ? (
                      <img src={supplier.logo_url} alt={supplier.company_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">🏪</span>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {supplier.company_name}
                      </h3>
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    </div>
                    
                    {supplier.specialty && (
                      <p className="text-sm text-muted-foreground truncate mb-2">{supplier.specialty}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{[supplier.city, supplier.state].filter(Boolean).join(', ') || 'India'}</span>
                      </div>
                      <Badge variant="outline" className={rep.className}>
                        {rep.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSuppliers;
