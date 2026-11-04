import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/ProductCard";
import { useSavedItems } from "@/hooks/useSavedItems";

const MAX_FEATURED = 8;

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { isProductSaved, toggleSaveProduct } = useSavedItems();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      // Same visibility rules as the Products page: approved products from
      // verified suppliers.
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, description, images,
          supplier_profiles!inner ( id, company_name, verification_status ),
          product_categories ( name )
        `)
        .eq("is_featured", true)
        .eq("status", "approved")
        .eq("supplier_profiles.verification_status", "verified")
        .order("updated_at", { ascending: false })
        .limit(MAX_FEATURED);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Nothing featured yet: leave the section out rather than show an empty block.
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Featured Products</h2>
            <p className="text-muted-foreground mt-2">Hand-picked products from verified FoodAdda suppliers</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/products")} className="shrink-0">
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                images={product.images}
                supplierName={product.supplier_profiles?.company_name}
                supplierId={product.supplier_profiles?.id}
                categoryName={product.product_categories?.name}
                isFeatured
                isSaved={isProductSaved(product.id)}
                onSaveToggle={() => toggleSaveProduct(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
