import { Building2, BarChart3, Headphones, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Business Platform",
    description: "Complete platform for food businesses to discover, connect, and grow together.",
  },
  {
    icon: BarChart3,
    title: "Your Food Dashboard",
    description: "Track your connections, manage enquiries, and monitor your food business performance.",
  },
  {
    icon: ShieldCheck,
    title: "Innovative Processing",
    description: "Verified suppliers with FSSAI compliance, quality certifications and trusted profiles.",
  },
  {
    icon: Headphones,
    title: "Product Support",
    description: "Dedicated support to help you find the right suppliers and resolve queries quickly.",
  },
];

const Stats = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Features</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
