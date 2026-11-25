import { Link, useNavigate } from "react-router-dom";
import { Factory, PackageSearch, Inbox, BadgeCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tileStyle } from "@/lib/brandVisuals";

const features = [
  { icon: Factory, title: "Capability profile", desc: "Show your facility, capacity, certifications and markets served." },
  { icon: PackageSearch, title: "Product catalogue", desc: "List products with grade, specifications, pack sizes and MOQ." },
  { icon: Inbox, title: "Relevant RFQs", desc: "Be considered for buyer requirements that match what you make." },
  { icon: BadgeCheck, title: "Documented review", desc: "Profiles and documents are reviewed against stated criteria." },
];

const ForSuppliers = () => {
  const navigate = useNavigate();
  return (
    <section id="for-suppliers" className="py-20 md:py-28 bg-warm scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow mb-4">For Manufacturers & Suppliers</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Showcase Your Capabilities. Receive Relevant RFQs.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Build a structured profile that helps buyers assess whether you can fulfil their
              requirement. Basic supplier registration is free.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="hero" size="lg" onClick={() => navigate("/auth?tab=signup")}>
                Join as a Supplier <ArrowRight className="w-5 h-5" />
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl border-2 border-secondary text-secondary font-semibold hover:bg-secondary hover:text-secondary-foreground">
                <Link to="/pricing">View Membership</Link>
              </Button>
            </div>
          </div>

          <div data-stagger className="grid sm:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="card-modern group p-6">
                <div className="icon-tile w-12 h-12 mb-5" style={tileStyle(i + 2)}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-heading mb-1 font-sans">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForSuppliers;
