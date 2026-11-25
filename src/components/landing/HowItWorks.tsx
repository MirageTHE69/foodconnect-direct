import { ClipboardList, Users, FileCheck2, Handshake } from "lucide-react";
import { PostRfqButton } from "@/components/shared/PostRfqButton";
import { tileStyle } from "@/lib/brandVisuals";

const steps = [
  { step: "01", icon: ClipboardList, title: "Share requirement", desc: "Buyer submits product, quantity, specifications and delivery location." },
  { step: "02", icon: Users, title: "Find suppliers", desc: "Foodadda qualifies the requirement and identifies suitable suppliers." },
  { step: "03", icon: FileCheck2, title: "Compare quotations", desc: "Suppliers provide price, MOQ, lead time, terms and specifications." },
  { step: "04", icon: Handshake, title: "Build business", desc: "Coordinate samples, negotiations, orders and repeat requirements." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 md:py-28 bg-fresh scroll-mt-20">
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mb-12">
        <p className="eyebrow mb-4">Simple 4-step process</p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">How Foodadda Works</h2>
        <p className="text-muted-foreground text-lg">
          Whatever your food business needs, post your requirement on Foodadda and connect with the
          right suppliers.
        </p>
      </div>

      <ol data-stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative">
        {steps.map(({ step, icon: Icon, title, desc }, i) => (
          <li key={step} className="card-modern group p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="icon-tile w-12 h-12" style={tileStyle(i)}>
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-4xl font-extrabold text-primary/15 group-hover:text-primary/30 transition-colors">{step}</span>
            </div>
            <h3 className="font-semibold text-lg text-heading mb-2 font-sans">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </li>
        ))}
      </ol>

      <PostRfqButton />
    </div>
  </section>
);

export default HowItWorks;
