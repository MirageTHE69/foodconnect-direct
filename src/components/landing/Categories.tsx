
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Apple, Wheat, Milk, Beef, Coffee, Flame, Cookie, Package,
  Leaf, Droplets, Box, Snowflake, Cog, Palette, Hotel, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

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
  display_order: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (!error && data) setCategories(data as Category[]);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                <div className="w-20 h-20 rounded-full bg-muted" />
                <div className="w-16 h-3 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Explore our wide range of categories
            </h2>
            <p className="text-muted-foreground mt-2">
              {categories.length} categories across products & services
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
          {categories.map((category) => {
            const IconComp = iconMap[category.icon] || Package;
            const isService = category.type === "service";

            return (
              <Link
                to={`/categories/${category.id}`}
                key={category.id}
                className="group flex flex-col items-center text-center"
              >
                <div
                  className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mb-3 transition-all duration-300 ${
                    isService
                      ? "bg-accent/10 border-accent/30 group-hover:border-accent group-hover:bg-accent/20"
                      : "bg-background border-border group-hover:border-primary group-hover:bg-primary/5"
                  }`}
                >
                  <IconComp
                    className={`w-8 h-8 transition-colors ${
                      isService
                        ? "text-accent group-hover:text-accent"
                        : "text-muted-foreground group-hover:text-primary"
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-foreground leading-tight">
                  {category.name}
                </span>
                {isService && (
                  <Badge variant="outline" className="mt-1 text-[10px] border-accent/40 text-accent px-1.5 py-0">
                    Service
                  </Badge>
                )}
                {category.item_count > 0 && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {category.item_count}+ items
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
