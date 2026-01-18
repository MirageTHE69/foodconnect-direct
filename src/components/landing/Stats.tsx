import { TrendingUp, MapPin, Package, Handshake } from "lucide-react";

const stats = [
  { 
    icon: MapPin, 
    value: "50+", 
    label: "Cities Covered", 
    description: "Across India",
    color: "bg-primary/10 text-primary"
  },
  { 
    icon: Package, 
    value: "12", 
    label: "Product Categories", 
    description: "From farm to table",
    color: "bg-secondary/10 text-secondary"
  },
  { 
    icon: Handshake, 
    value: "10K+", 
    label: "Connections Made", 
    description: "And growing daily",
    color: "bg-accent/10 text-accent"
  },
  { 
    icon: TrendingUp, 
    value: "95%", 
    label: "Success Rate", 
    description: "Satisfied businesses",
    color: "bg-primary/10 text-primary"
  },
];

const Stats = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary via-primary to-accent relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl md:text-5xl font-extrabold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-lg font-semibold text-white/90 mb-1">
                {stat.label}
              </p>
              <p className="text-sm text-white/70">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
