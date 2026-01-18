import { 
  Wheat, 
  IceCream, 
  Coffee, 
  Beef, 
  Fish, 
  Apple, 
  Milk, 
  Cookie,
  ArrowRight,
  Leaf,
  Droplets,
  Package,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categories = [
  { icon: Wheat, name: "Grains & Cereals", count: "120+ Suppliers", color: "bg-amber-500/10 text-amber-600", trending: false },
  { icon: Beef, name: "Meat & Poultry", count: "85+ Suppliers", color: "bg-red-500/10 text-red-600", trending: false },
  { icon: Fish, name: "Seafood", count: "60+ Suppliers", color: "bg-blue-500/10 text-blue-600", trending: false },
  { icon: Milk, name: "Dairy Products", count: "95+ Suppliers", color: "bg-sky-500/10 text-sky-600", trending: true },
  { icon: Apple, name: "Fresh Produce", count: "150+ Suppliers", color: "bg-green-500/10 text-green-600", trending: true },
  { icon: Cookie, name: "Bakery & Snacks", count: "110+ Suppliers", color: "bg-orange-500/10 text-orange-600", trending: false },
  { icon: Coffee, name: "Beverages", count: "75+ Suppliers", color: "bg-amber-700/10 text-amber-800", trending: false },
  { icon: IceCream, name: "Frozen Foods", count: "65+ Suppliers", color: "bg-cyan-500/10 text-cyan-600", trending: false },
  { icon: Flame, name: "Spices & Condiments", count: "130+ Suppliers", color: "bg-rose-500/10 text-rose-600", trending: true },
  { icon: Droplets, name: "Oils & Fats", count: "55+ Suppliers", color: "bg-yellow-500/10 text-yellow-600", trending: false },
  { icon: Package, name: "Packaged Foods", count: "90+ Suppliers", color: "bg-violet-500/10 text-violet-600", trending: false },
  { icon: Leaf, name: "Organic Products", count: "70+ Suppliers", color: "bg-emerald-500/10 text-emerald-600", trending: false },
];

const Categories = () => {
  return (
    <section id="categories" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Explore Categories
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Find Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Perfect Match</span>
            </h2>
          </div>
          <Button variant="outline" className="self-start md:self-auto">
            View All Categories
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Categories Grid - Now 12 items */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              className="group relative overflow-hidden rounded-2xl p-6 bg-card border border-border/50 hover:border-primary/30 shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300 text-left"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500" />
              
              {/* Trending badge */}
              {category.trending && (
                <Badge variant="secondary" className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-xs">
                  Trending
                </Badge>
              )}
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl ${category.color.split(' ')[0]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className={`w-7 h-7 ${category.color.split(' ')[1]}`} />
                </div>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">{category.count}</p>
              </div>

              {/* Hover arrow */}
              <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
