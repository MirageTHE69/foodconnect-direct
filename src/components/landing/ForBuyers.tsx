import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostRfqButton } from "@/components/shared/PostRfqButton";

const points = [
  "Post a requirement free, with no paid membership",
  "Share product, quantity, specifications and delivery location",
  "Get matched with suitable manufacturers and suppliers",
  "Compare quotations on price, MOQ, lead time and terms",
];

const ForBuyers = () => (
  <section id="for-buyers" className="py-20 md:py-24 bg-navy-glow text-secondary-foreground scroll-mt-20 relative overflow-hidden">
    <div className="absolute inset-0 bg-dots-light pointer-events-none" />
    <div className="container mx-auto px-4 relative">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-lg">
          <p className="eyebrow-dark mb-4">For Buyers</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Post Your Requirement. Source With Confidence.
          </h2>
          <p className="text-secondary-foreground/75 text-lg mb-8">
            Whether you need raw materials, ingredients, packaged foods, packaging or equipment,
            tell us what you need and Foodadda will help you find the right suppliers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <PostRfqButton />
            <Button asChild size="lg" variant="outline" className="bg-transparent border-secondary-foreground/40 text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
              <Link to="/suppliers">Find Manufacturers</Link>
            </Button>
          </div>
        </div>

        <ul data-stagger className="grid sm:grid-cols-2 gap-4">
          {points.map((p) => (
            <li key={p} className="card-dark p-6 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
              <span className="text-secondary-foreground/90">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default ForBuyers;
