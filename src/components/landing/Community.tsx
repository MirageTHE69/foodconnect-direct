import { MessageCircle, Users, Utensils, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnchorNav } from "@/hooks/useAnchorNav";

const Community = () => {
  const goToAnchor = useAnchorNav();

  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            HORECA & Hotels{" "}
            <span className="bg-primary text-primary-foreground px-2 -skew-x-1 inline-block">
              Community
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join India's largest network of Hotels, Restaurants & Catering professionals.
            Get exclusive deals, industry updates, and connect with peers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
          {[
            { icon: Building2, label: "Hotels & Resorts" },
            { icon: Utensils, label: "Restaurants & Cafés" },
            { icon: Users, label: "Catering & Events" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-background border border-border/50 shadow-soft"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <span className="font-semibold text-foreground">{label}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a href="#hero" onClick={goToAnchor("#hero")}>
            <Button
              size="lg"
              className="bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-hover hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 rounded-xl h-14 px-8 text-base font-semibold"
            >
              <MessageCircle className="w-5 h-5" />
              Join Community on WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Community;
