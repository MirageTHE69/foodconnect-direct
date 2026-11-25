import { Link } from "react-router-dom";
import {
  Carrot, Package, UtensilsCrossed, Boxes, Search, Users, FlaskConical, Truck,
  ShieldCheck, Factory, BadgeCheck, Activity, Phone, Mail, MessageCircle, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostRfqButton } from "@/components/shared/PostRfqButton";
import { IMAGES, tileStyle } from "@/lib/brandVisuals";

export const CONTACT = {
  phone: "+91 93281 37674",
  phoneHref: "tel:+919328137674",
  whatsapp: "https://wa.me/919328137674?text=" + encodeURIComponent("Hi Foodadda, I have a sourcing requirement."),
  email: "info@foodadda.in",
};

export const HORECA_GROUPS = [
  { icon: Carrot, title: "Food & Ingredients", desc: "Vegetables, fruits, meat, seafood, dairy, spices and groceries." },
  { icon: Package, title: "Processed & Packaged Foods", desc: "Frozen foods, ready-to-cook products, sauces and bakery products." },
  { icon: UtensilsCrossed, title: "Kitchen & Operational Supplies", desc: "Equipment, packaging, disposables and cleaning supplies." },
  { icon: Boxes, title: "Bulk Procurement", desc: "Regular requirements, institutional sourcing and negotiated supplier quotations." },
];

export const DESK_SERVICES = [
  { icon: Search, title: "Managed sourcing", desc: "Our team takes your requirement and runs the search for you." },
  { icon: Users, title: "Supplier matching", desc: "Matched on category, capability, MOQ, location and product fit." },
  { icon: FlaskConical, title: "Sample coordination", desc: "Sample requests, dispatch, receipt and your feedback, tracked." },
  { icon: Truck, title: "Procurement support", desc: "Help with negotiation, orders and repeat requirements." },
];

export const VERIFICATION_STATUSES = [
  { icon: ShieldCheck, title: "Business Verified", desc: "Business identity and required documents checked." },
  { icon: Factory, title: "Factory Verified", desc: "Manufacturing facility and capability evidence checked; method and date recorded." },
  { icon: BadgeCheck, title: "Quality Verified", desc: "Relevant quality systems and certificates checked for scope and validity." },
  { icon: Activity, title: "Commercially Active", desc: "Supplier is responding to RFQs and taking part in business enquiries." },
];

interface CardItem { icon: React.ElementType; title: string; desc: string }

export const IconCards = ({ items, cols = 4, tone = "light" }: { items: CardItem[]; cols?: 2 | 4; tone?: "light" | "dark" }) => (
  <div data-stagger className={`grid sm:grid-cols-2 ${cols === 4 ? "lg:grid-cols-4" : ""} gap-4 md:gap-6`}>
    {items.map(({ icon: Icon, title, desc }, i) => (
      <div
        key={title}
        className={tone === "dark"
          ? "card-dark group p-6"
          : "card-modern group p-6"}
      >
        <div
          className="icon-tile w-12 h-12 mb-5"
          style={tileStyle(tone === "dark" ? i + 1 : i)}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h3 className={`font-semibold mb-1 font-sans ${tone === "dark" ? "text-secondary-foreground" : "text-heading"}`}>{title}</h3>
        <p className={`text-sm ${tone === "dark" ? "text-secondary-foreground/70" : "text-muted-foreground"}`}>{desc}</p>
      </div>
    ))}
  </div>
);

export const HoReCaSection = ({ showPageLink = true }: { showPageLink?: boolean }) => (
  <section id="horeca" className="py-20 md:py-28 bg-warm scroll-mt-20 relative overflow-hidden">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-12">
      <div>
        <p className="eyebrow mb-4">Foodadda HoReCa</p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          Source Better. Serve Better. Grow Better.
        </h2>
        <p className="text-lg text-muted-foreground">
          Foodadda HoReCa connects hotels, restaurants, cafés, caterers and institutional kitchens
          with manufacturers, food suppliers and distributors for their everyday procurement needs –
          from fresh produce, ingredients and packaged foods to kitchen essentials and equipment.
        </p>
      </div>
      <div className="relative">
        <div className="grid grid-cols-5 grid-rows-2 gap-3 h-72 md:h-96">
          <img src={IMAGES.kitchen} alt="Chefs cooking in a restaurant kitchen" loading="lazy" className="col-span-3 row-span-2 w-full h-full object-cover rounded-2xl shadow-card" />
          <img src={IMAGES.produce} alt="Fresh vegetables and fruit" loading="lazy" className="col-span-2 w-full h-full object-cover rounded-2xl shadow-card" />
          <img src={IMAGES.dishes} alt="Prepared dishes" loading="lazy" className="col-span-2 w-full h-full object-cover rounded-2xl shadow-card" />
        </div>
        <div className="absolute -bottom-5 left-6 glass rounded-2xl px-4 py-3 shadow-card flex items-center gap-3 animate-float-slow">
          <div className="icon-tile w-9 h-9" style={tileStyle(1)}><UtensilsCrossed className="w-4 h-4" /></div>
          <p className="text-sm font-semibold text-heading">Hotels · Restaurants · Cafés · Caterers</p>
        </div>
      </div>
      </div>
      <IconCards items={HORECA_GROUPS} />
      <div className="flex flex-col sm:flex-row gap-3 mt-10">
        <PostRfqButton>Post a HoReCa Requirement</PostRfqButton>
        {showPageLink && (
          <Button asChild size="lg" variant="outline" className="rounded-xl border-2 border-secondary text-secondary font-semibold hover:bg-secondary hover:text-secondary-foreground">
            <Link to="/horeca">Explore HoReCa Sourcing</Link>
          </Button>
        )}
      </div>
    </div>
  </section>
);

export const SourcingDeskSection = ({ showPageLink = true }: { showPageLink?: boolean }) => (
  <section id="sourcing-desk" className="py-20 md:py-24 bg-navy-glow text-secondary-foreground scroll-mt-20 relative overflow-hidden">
    <div className="absolute inset-0 bg-dots-light pointer-events-none" />
    <div className="container mx-auto px-4 relative">
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
        <div>
          <p className="eyebrow-dark mb-4">Foodadda Sourcing Desk</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Let Our Team Source It for You
          </h2>
          <p className="text-secondary-foreground/75 text-lg mb-8">
            Managed sourcing and procurement support for food businesses. Share your requirement and
            a Foodadda sourcing specialist will qualify it, find suitable suppliers and help you move
            from quotation to sample to order.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <PostRfqButton>Talk to the Sourcing Desk</PostRfqButton>
            {showPageLink && (
              <Button asChild size="lg" variant="outline" className="bg-transparent border-secondary-foreground/40 text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
                <Link to="/sourcing-desk">How It Works <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            )}
          </div>
        </div>
        <IconCards items={DESK_SERVICES} cols={2} tone="dark" />
      </div>
    </div>
  </section>
);

export const TrustSection = () => (
  <section id="trust" className="py-20 md:py-28 bg-mesh scroll-mt-20">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
        <div>
          <p className="eyebrow mb-4">Trust & Verification</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How We Review Suppliers</h2>
          <p className="text-muted-foreground mb-6">
            Verification statuses on Foodadda are shown only after a documented check. We record who
            checked what, and when. These are Foodadda review statuses, not certifications. A
            certificate is never shown as verified just because it was uploaded.
          </p>
          <Link to="/about#verification" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Read our verification policy <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="mt-8 space-y-3 text-sm">
            <a href={CONTACT.phoneHref} className="flex items-center gap-3 text-foreground hover:text-primary">
              <Phone className="w-4 h-4 text-primary" /> {CONTACT.phone}
            </a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-foreground hover:text-primary">
              <MessageCircle className="w-4 h-4 text-primary" /> WhatsApp the sourcing team
            </a>
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 text-foreground hover:text-primary">
              <Mail className="w-4 h-4 text-primary" /> {CONTACT.email}
            </a>
          </div>
        </div>
        <IconCards items={VERIFICATION_STATUSES} cols={2} />
      </div>
    </div>
  </section>
);

const MARQUEE_ITEMS = [
  "Spices & Masalas", "Grains, Pulses & Staples", "Food Ingredients", "Additives & Enhancers",
  "Packaged & Processed Foods", "Sauces & Condiments", "Frozen & Ready-to-Cook", "Fresh Produce",
  "Food Packaging", "Food Machinery & Equipment", "Testing & Quality Services", "HoReCa Supplies",
  "Dairy", "Meat, Poultry & Seafood", "Beverages", "Bakery & Confectionery", "Oils & Fats",
];

/** Endless scrolling strip of sourcing categories. */
export const CategoryMarquee = () => (
  <div className="relative py-4 overflow-hidden bg-gradient-to-r from-secondary via-[hsl(170_45%_22%)] to-secondary" data-no-reveal aria-label="Categories we source">
    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-secondary to-transparent z-10" />
    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-secondary to-transparent z-10" />
    <div className="marquee">
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
        <span key={i} className="flex items-center gap-3 px-6 text-sm font-medium text-secondary-foreground/80 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
          {item}
        </span>
      ))}
    </div>
  </div>
);

/** Closing call to action card used at the end of inner pages. */
export const RfqBand = ({ title = "Have a requirement?", text = "Post your RFQ free and connect with the right suppliers." }: { title?: string; text?: string }) => (
  <section className="py-16 md:py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="relative overflow-hidden rounded-3xl gradient-primary text-primary-foreground p-8 md:p-14 shadow-[0_30px_60px_-25px_hsl(150_55%_27%/0.6)]">
        <div className="absolute inset-0 bg-dots-light" />
        <div className="blob w-72 h-72 bg-brand-orange/40 -top-24 -right-16" />
        <div className="blob w-60 h-60 bg-white/20 -bottom-24 left-10" style={{ animationDelay: "-8s" }} />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
            <p className="text-primary-foreground/85 mt-2 text-lg">{text}</p>
          </div>
          <PostRfqButton variant="secondary" className="bg-white text-primary hover:bg-white/90 rounded-xl h-14 px-7 font-semibold shadow-lg self-start md:self-auto" />
        </div>
      </div>
    </div>
  </section>
);
