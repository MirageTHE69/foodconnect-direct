import { 
  Wheat, IceCream, Coffee, Beef, Fish, Apple, Milk, Cookie,
  ArrowRight, Leaf, Droplets, Package, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { icon: Wheat, name: "Grains & Cereals", count: "120+" },
  { icon: Beef, name: "Meat & Poultry", count: "85+" },
  { icon: Fish, name: "Seafood", count: "60+" },
  { icon: Milk, name: "Dairy Products", count: "95+" },
  { icon: Apple, name: "Fresh Produce", count: "150+" },
  { icon: Cookie, name: "Bakery & Snacks", count: "110+" },
  { icon: Coffee, name: "Beverages", count: "75+" },
  { icon: IceCream, name: "Frozen Foods", count: "65+" },
  { icon: Flame, name: "Spices", count: "130+" },
  { icon: Droplets, name: "Oils & Fats", count: "55+" },
  { icon: Package, name: "Packaged Foods", count: "90+" },
  { icon: Leaf, name: "Organic", count: "70+" },
];

const Categories = () => {
  return (
    <section id="categories" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Explore our wide range of categories
          </h2>
          <Button variant="hero" size="sm" className="hidden md:inline-flex">
            View all
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
          {categories.map((category) => (
            <button
              key={category.name}
              className="group flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-background border-2 border-border hover:border-primary flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-all duration-300">
                <category.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground leading-tight">{category.name}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{category.count}</span>
            </button>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center md:hidden">
          <Button variant="hero" size="sm">
            View all
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Categories;
