import { Search, Building2, MessageSquare, Handshake } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover",
    description: "Browse through verified food suppliers, manufacturers, and brands across categories.",
    color: "primary",
  },
  {
    icon: Building2,
    title: "Explore Profiles",
    description: "View detailed business profiles, certifications, product catalogs, and recipes.",
    color: "secondary",
  },
  {
    icon: MessageSquare,
    title: "Connect Directly",
    description: "Start a conversation with suppliers through our secure chat. No middlemen.",
    color: "accent",
  },
  {
    icon: Handshake,
    title: "Do Business",
    description: "Negotiate, agree on terms, and build lasting business relationships.",
    color: "primary",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            How <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">FoodAdda</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We've simplified how food businesses find and connect with each other. 
            No complex processes, just direct connections.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative group"
            >
              {/* Connector line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-border" />
              )}

              <div className="relative bg-card rounded-2xl p-8 shadow-card hover:shadow-hover transition-all duration-300 border border-border/50 group-hover:border-primary/30">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${
                  step.color === 'primary' ? 'bg-primary/10' :
                  step.color === 'secondary' ? 'bg-secondary/10' :
                  'bg-accent/10'
                }`}>
                  <step.icon className={`w-8 h-8 ${
                    step.color === 'primary' ? 'text-primary' :
                    step.color === 'secondary' ? 'text-secondary' :
                    'text-accent'
                  }`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
