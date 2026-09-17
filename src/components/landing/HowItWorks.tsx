import { Search, MessageCircle, TrendingUp, ShieldCheck } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Discover",
    desc: "Browse verified food suppliers, manufacturers, and products across 12+ categories — from raw ingredients to packaging and equipment — filtered by location, certifications, and MOQ.",
  },
  {
    step: "02",
    icon: MessageCircle,
    title: "Connect",
    desc: "Connect directly with food suppliers and buyers, share your requirements, and negotiate inside FoodAdda — with no brokers or middlemen.",
  },
  {
    step: "03",
    icon: ShieldCheck,
    title: "Verify",
    desc: "Check FSSAI status, quality certifications, and business details before you connect, helping you choose trusted food industry partners with confidence.",
  },
  {
    step: "04",
    icon: TrendingUp,
    title: "Grow",
    desc: "Build lasting B2B food business partnerships, turn orders into reliable supply relationships, and discover new suppliers, buyers, and opportunities as your business grows.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Curious About How FoodAdda{" "}
              <span className="bg-primary text-primary-foreground px-2 -skew-x-1 inline-block">Works?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-md">
              FoodAdda makes it simple for food businesses to find trusted suppliers, discover
              products, and connect with buyers and industry partners. Search for food suppliers
              and products, start conversations, manage enquiries, and build lasting B2B
              partnerships — all in one platform, from your first search to repeat orders.
            </p>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-card">
              <div className="space-y-6">
                {steps.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-foreground" />
                        </div>
                        {i < steps.length - 1 && <div className="w-px flex-1 min-h-[16px] bg-primary/20 mt-2" />}
                      </div>
                      <div className="pb-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-primary tracking-wide">{item.step}</span>
                          <h3 className="font-bold text-foreground">{item.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 w-full h-full rounded-3xl border-2 border-primary/20 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
