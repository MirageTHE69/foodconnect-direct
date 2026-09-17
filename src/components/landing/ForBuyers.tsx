import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { PostRequirementDialog } from "@/components/shared/PostRequirementDialog";

const ForBuyers = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section id="for-buyers" className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden scroll-mt-20">
      {/* Yellow diagonal accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 skew-x-[-8deg] translate-x-32" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-lg">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Have a Requirement for Food Products or Supplies?
            </h2>
            <p className="text-secondary-foreground/70 text-lg mb-8">
              Tell us what you need, and we'll connect you with trusted food suppliers,
              manufacturers, distributors, and brands across India. Find the right products,
              build direct business connections, and source with zero commissions and no middlemen.
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => setDialogOpen(true)}
            >
              Post Requirement
              <ArrowRight className="w-5 h-5" />
            </Button>
            <PostRequirementDialog open={dialogOpen} onOpenChange={setDialogOpen} />
          </div>

          {/* Right side visual placeholder */}
          <div className="hidden lg:flex justify-center">
            <div className="w-80 h-80 rounded-3xl bg-primary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🤝</div>
                <p className="text-secondary-foreground/80 font-medium">Direct Connections</p>
                <p className="text-secondary-foreground/50 text-sm mt-1">No middlemen, no commissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForBuyers;
