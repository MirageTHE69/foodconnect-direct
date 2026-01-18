import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote: "FoodAdda transformed how we source ingredients. We found 3 new reliable suppliers within a week. The direct communication saves us so much time!",
    author: "Priya Sharma",
    role: "Head Chef",
    company: "The Grand Kitchen, Mumbai",
    avatar: "PS",
    rating: 5,
  },
  {
    id: 2,
    quote: "As a supplier, getting verified was simple. Now buyers come to us directly. Our enquiries increased 5x since joining the platform.",
    author: "Rajesh Patel",
    role: "Owner",
    company: "Patel Dairy Farms, Anand",
    avatar: "RP",
    rating: 5,
  },
  {
    id: 3,
    quote: "The category filters and verified badges help us quickly find quality suppliers. It's like having a food industry directory in your pocket.",
    author: "Meera Krishnan",
    role: "Procurement Manager",
    company: "Spice Route Hotels, Kochi",
    avatar: "MK",
    rating: 5,
  },
];

const trustBadges = [
  { label: "FSSAI Partner", icon: "🏛️" },
  { label: "Secure Platform", icon: "🔒" },
  { label: "24/7 Support", icon: "💬" },
  { label: "100% Free for Buyers", icon: "✨" },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Trusted by <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Food Businesses</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of businesses who have transformed their sourcing with FoodAdda.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-2xl p-8 border border-border/50 shadow-card relative group hover:border-primary/30 transition-all duration-300"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Quote className="w-5 h-5 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-primary">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-3 px-6 py-3 bg-card rounded-full border border-border/50 shadow-card"
            >
              <span className="text-xl">{badge.icon}</span>
              <span className="font-medium text-sm">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
