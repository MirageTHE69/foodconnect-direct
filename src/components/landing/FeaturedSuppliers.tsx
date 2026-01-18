import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const featuredSuppliers = [
  {
    id: 1,
    name: "Fresh Farms India",
    category: "Fresh Produce",
    location: "Pune, Maharashtra",
    rating: 4.9,
    products: 45,
    verified: true,
    logo: "🌾",
  },
  {
    id: 2,
    name: "Dairy Delights",
    category: "Dairy Products",
    location: "Anand, Gujarat",
    rating: 4.8,
    products: 32,
    verified: true,
    logo: "🥛",
  },
  {
    id: 3,
    name: "Spice Masters",
    category: "Spices & Condiments",
    location: "Kochi, Kerala",
    rating: 4.9,
    products: 78,
    verified: true,
    logo: "🌶️",
  },
  {
    id: 4,
    name: "Ocean Fresh",
    category: "Seafood",
    location: "Chennai, Tamil Nadu",
    rating: 4.7,
    products: 56,
    verified: true,
    logo: "🐟",
  },
  {
    id: 5,
    name: "Grain Valley",
    category: "Grains & Cereals",
    location: "Indore, MP",
    rating: 4.8,
    products: 89,
    verified: true,
    logo: "🌽",
  },
  {
    id: 6,
    name: "Nutri Proteins",
    category: "Meat & Poultry",
    location: "Hyderabad, Telangana",
    rating: 4.6,
    products: 41,
    verified: true,
    logo: "🍗",
  },
];

const FeaturedSuppliers = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
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

        {/* Suppliers Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {featuredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="group bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 shadow-card hover:shadow-hover transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl">
                  {supplier.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {supplier.name}
                    </h3>
                    {supplier.verified && (
                      <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-primary font-medium">{supplier.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{supplier.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="font-semibold">{supplier.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">{supplier.products} Products</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
            View All Suppliers
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSuppliers;
