import { TrendingUp, BarChart3, Target } from "lucide-react";

const solutions = [
  {
    icon: TrendingUp,
    title: "Expand Your Reach",
    description: "Connect with food businesses across 50+ cities in India. Expand your supplier or buyer network and discover new B2B business opportunities.",
  },
  {
    icon: BarChart3,
    title: "Track Performance",
    description: "Monitor enquiries, connections, and business activity through your personalized FoodAdda dashboard.",
  },
  {
    icon: Target,
    title: "Targeted Discovery",
    description: "Find the right food suppliers, buyers, manufacturers, and products with smart search and category filters designed to help you discover exactly what you need.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Growth Solutions
        </h2>
        <p className="text-muted-foreground text-lg mb-12 max-w-2xl">
          Powerful tools and features designed to grow your food business, connect with trusted industry partners,
          and build lasting B2B relationships.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution) => (
            <div
              key={solution.title}
              className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <solution.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{solution.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{solution.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
