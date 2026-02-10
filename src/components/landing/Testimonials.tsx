import { TrendingUp, BarChart3, Target } from "lucide-react";

const solutions = [
  {
    icon: TrendingUp,
    title: "Expand Your Reach",
    description: "Connect with food businesses across 50+ cities in India. Grow your supplier or buyer network exponentially.",
  },
  {
    icon: BarChart3,
    title: "Track Performance",
    description: "Monitor enquiries, connections, and business metrics through your personalized dashboard.",
  },
  {
    icon: Target,
    title: "Targeted Discovery",
    description: "Smart search and category filters help you find exactly what you need, when you need it.",
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
          Tools and features designed to accelerate your food business growth and build lasting industry partnerships.
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
