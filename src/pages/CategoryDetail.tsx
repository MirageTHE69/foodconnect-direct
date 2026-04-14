
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Apple, Wheat, Milk, Beef, Coffee, Flame, Cookie, Package,
  Leaf, Droplets, Box, Snowflake, Cog, Palette, Hotel,
  ArrowLeft, ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const iconMap: Record<string, React.ElementType> = {
  Apple, Wheat, Milk, Beef, Coffee, Flame, Cookie, Package,
  Leaf, Droplets, Box, Snowflake, Cog, Palette, Hotel,
};

interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
  item_count: number;
}

interface SubCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
}

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [catRes, subRes] = await Promise.all([
        supabase.from("categories").select("*").eq("id", id).single(),
        supabase.from("sub_categories").select("*").eq("category_id", id).order("display_order"),
      ]);
      if (catRes.data) setCategory(catRes.data as Category);
      if (subRes.data) setSubCategories(subRes.data as SubCategory[]);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground">Category not found</h1>
          <Button asChild className="mt-4" variant="hero">
            <Link to="/#categories">Back to Categories</Link>
          </Button>
        </div>
      </div>
    );
  }

  const IconComp = iconMap[category.icon] || Package;
  const isService = category.type === "service";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <Link
            to="/#categories"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Categories
          </Link>

          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isService ? "bg-accent/15" : "bg-primary/10"
              }`}
            >
              <IconComp className={`w-8 h-8 ${isService ? "text-accent" : "text-primary"}`} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {category.name}
                </h1>
                {isService && (
                  <Badge className="bg-accent/15 text-accent border-accent/30">Service</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {subCategories.length} sub-categories
                {category.item_count > 0 && ` · ${category.item_count}+ items`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-categories grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subCategories.map((sub) => (
              <Link key={sub.id} to={`/categories/${id}/sub/${sub.id}`}>
                <Card
                  className="group hover:shadow-hover transition-all duration-300 cursor-pointer border-border hover:border-primary/30"
                >
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {sub.name}
                      </h3>
                      {sub.description && (
                        <p className="text-sm text-muted-foreground mt-1">{sub.description}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {subCategories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No sub-categories available yet.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoryDetail;
