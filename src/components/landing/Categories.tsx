import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Apple, Wheat, Milk, Beef, Coffee, Flame, Cookie, Package,
  Leaf, Droplets, Box, Snowflake, Cog, Palette, Hotel, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { categoryImage, tileStyle } from "@/lib/brandVisuals";

const iconMap: Record<string, React.ElementType> = {
  Apple, Wheat, Milk, Beef, Coffee, Flame, Cookie, Package,
  Leaf, Droplets, Box, Snowflake, Cog, Palette, Hotel,
};

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  type: string;
  item_count: number;
  display_order: number;
}

interface CategoriesProps {
  /** Show only the first N product categories, with a "View All" link. */
  limit?: number;
  showHeader?: boolean;
}

const Categories = ({ limit, showHeader = true }: CategoriesProps) => {
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

  // Product categories and business services are shown separately.
  const allProducts = categories.filter((c) => c.type !== "service");
  const products = limit ? allProducts.slice(0, limit) : allProducts;
  const services = limit ? [] : categories.filter((c) => c.type === "service");

  const renderCard = (category: Category, i: number) => {
    const IconComp = iconMap[category.icon] || Package;
    return (
      <Link
        to={`/categories/${category.slug}`}
        key={category.id}
        className="group card-modern overflow-hidden flex flex-col"
      >
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={categoryImage(category.slug)}
            alt={category.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-secondary/10 to-transparent" />
          <div className="absolute left-3 bottom-3 icon-tile w-10 h-10 ring-2 ring-white/70" style={tileStyle(i)}>
            <IconComp className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 md:p-5">
          <h3 className="font-semibold text-heading leading-snug line-clamp-2 min-h-[2.75rem] font-sans">{category.name}</h3>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-1">
            Explore suppliers <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </Link>
    );
  };

  const grid = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6";

  return (
    <section id="categories" className="py-20 md:py-28 bg-mesh scroll-mt-20">
      <div className="container mx-auto px-4">
        {showHeader && (
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="eyebrow mb-4">Product categories</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Explore Food Categories</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                From spices and staples to packaging, machinery and testing services, find suppliers
                for every part of your food business.
              </p>
            </div>
            {limit && (
              <Button asChild variant="outline" className="rounded-xl border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground self-start md:self-auto">
                <Link to="/categories">View All Categories <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            )}
          </div>
        )}

        {loading ? (
          <div className={grid}>
            {Array.from({ length: limit ?? 12 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className={grid} data-stagger>{products.map(renderCard)}</div>

            {services.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-foreground mt-14 mb-6">Business Services</h3>
                <div className={grid} data-stagger>{services.map(renderCard)}</div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Categories;
