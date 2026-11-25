import { useEffect, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardList, Factory, Truck, Boxes, Tag, ListChecks, PackageSearch, Inbox, FileText,
  Building2, Hotel, Coffee, ChefHat, School, CheckCircle2, ArrowRight,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import HowItWorks from "@/components/landing/HowItWorks";
import Categories from "@/components/landing/Categories";
import Pricing from "@/components/landing/Pricing";
import { Button } from "@/components/ui/button";
import { PostRfqButton } from "@/components/shared/PostRfqButton";
import {
  HoReCaSection, TrustSection, RfqBand, IconCards,
  DESK_SERVICES, VERIFICATION_STATUSES, CONTACT,
} from "@/components/landing/SourcingSections";

const Page = ({ title, children }: { title: string; children: ReactNode }) => {
  const { hash } = useLocation();
  useEffect(() => {
    document.title = `${title} | Foodadda – Sourcing Simplified`;
  }, [title]);
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 50);
    return () => clearTimeout(t);
  }, [hash]);
  return (
    <div className="min-h-screen bg-background" data-reveal-root>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

const PageHero = ({ eyebrow, title, text, children }: { eyebrow: string; title: string; text: string; children?: ReactNode }) => (
  <section id="hero" className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-mesh overflow-hidden">
    <div className="absolute inset-0 bg-grid pointer-events-none" />
    <div className="blob w-72 h-72 bg-primary/25 -top-10 right-[10%]" />
    <div className="blob w-60 h-60 bg-brand-orange/25 bottom-0 left-[5%]" style={{ animationDelay: "-6s" }} />
    <div className="container mx-auto px-4 max-w-3xl relative text-center">
      <p className="eyebrow mb-5 hero-in">{eyebrow}</p>
      <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-[1.08] mb-6 hero-in" style={{ animationDelay: "80ms" }}>{title}</h1>
      <p className="text-lg text-muted-foreground mb-9 hero-in" style={{ animationDelay: "160ms" }}>{text}</p>
      {children && <div className="flex flex-col sm:flex-row gap-3 justify-center hero-in" style={{ animationDelay: "240ms" }}>{children}</div>}
    </div>
  </section>
);

const Block = ({ title, text, children, tone = "bg-background" }: { title: string; text?: string; children: ReactNode; tone?: string }) => (
  <section className={`py-16 md:py-24 ${tone}`}>
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{title}</h2>
      {text && <p className="text-muted-foreground max-w-2xl mb-10">{text}</p>}
      <div className={text ? "" : "mt-8"}>{children}</div>
    </div>
  </section>
);

const outlineNavy = "rounded-xl bg-white/60 backdrop-blur border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground";

export const BuyersPage = () => (
  <Page title="For Buyers">
    <PageHero
      eyebrow="For Buyers"
      title="Post Your Requirement and Connect With the Right Suppliers"
      text="Whatever your food business needs, from raw materials and ingredients to packaging and equipment, post an RFQ for free and receive quotations from relevant suppliers. No paid membership is needed to enquire."
    >
      <PostRfqButton />
      <Button asChild size="lg" variant="outline" className={outlineNavy}><Link to="/suppliers">Find Manufacturers</Link></Button>
    </PageHero>
    <Block
      title="What You Can Source"
      text="Post a requirement for anything your food business buys, or browse suppliers directly."
    >
      <IconCards items={[
        { icon: Factory, title: "Find manufacturers", desc: "Discover manufacturers by category, capability and location." },
        { icon: Truck, title: "Find distributors", desc: "Connect with distributors and wholesalers for regular supply." },
        { icon: Boxes, title: "Bulk sourcing", desc: "Share volume, frequency and specifications for bulk requirements." },
        { icon: Tag, title: "Private label", desc: "Find partners for private label and contract manufacturing." },
      ]} />
    </Block>
    <HowItWorks />
    <Block title="What to Include in Your RFQ" text="A clear requirement gets faster, more comparable quotations." tone="bg-background">
      <ul data-stagger className="grid sm:grid-cols-2 gap-3 max-w-3xl">
        {[
          "Exact product name and category",
          "Quantity, unit and purchase frequency",
          "Grade, quality or technical specification",
          "Packaging and required certifications",
          "Target price (optional) and expected delivery date",
          "Delivery city, state and PIN code",
        ].map((t) => (
          <li key={t} className="card-modern flex gap-3 p-4">
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground mt-6">
        Track your requirements and enquiries from your <Link to="/dashboard" className="text-primary font-medium hover:underline">dashboard</Link>.
      </p>
    </Block>
    <RfqBand />
  </Page>
);

export const SuppliersInfoPage = () => {
  const navigate = useNavigate();
  return (
    <Page title="For Suppliers">
      <PageHero
        eyebrow="For Manufacturers & Suppliers"
        title="Showcase Your Products and Capabilities to Serious Buyers"
        text="Build a structured capability profile, list your product catalogue and be considered for relevant buyer RFQs. Basic supplier registration is free."
      >
        <Button variant="hero" size="lg" onClick={() => navigate("/auth?tab=signup")}>Join as a Supplier <ArrowRight className="w-5 h-5" /></Button>
        <Button asChild size="lg" variant="outline" className={outlineNavy}><Link to="/pricing">View Membership</Link></Button>
      </PageHero>
      <Block title="What Your Profile Includes" text="Profiles help buyers judge whether you can fulfil their requirement, not just how to contact you.">
        <IconCards items={[
          { icon: Building2, title: "Business identity", desc: "Business name and type, address, contact person, GSTIN and FSSAI details." },
          { icon: Factory, title: "Factory capabilities", desc: "Facility location, production lines, installed and available capacity." },
          { icon: PackageSearch, title: "Product catalogue", desc: "Grade, specifications, ingredients, pack sizes, MOQ and documents." },
          { icon: FileText, title: "Certifications", desc: "Certificate type, issuer, scope, number and validity." },
        ]} />
      </Block>
      <Block title="How Suppliers Get Business" tone="bg-card">
        <IconCards items={[
          { icon: ClipboardList, title: "Complete your profile", desc: "Add capability, product and commercial details." },
          { icon: ListChecks, title: "Get reviewed", desc: "Documents are checked against our stated verification criteria." },
          { icon: Inbox, title: "Receive relevant RFQs", desc: "Be matched to requirements that fit your products and capacity." },
          { icon: FileText, title: "Manage quotations", desc: "Respond to enquiries and manage your catalogue from your dashboard." },
        ]} />
      </Block>
      <RfqBand title="Ready to grow your food business?" text="Register free and start building your supplier profile." />
    </Page>
  );
};

export const CategoriesPage = () => (
  <Page title="Product Categories">
    <PageHero
      eyebrow="Product Categories"
      title="All Food Categories"
      text="Browse product categories and business services. Can't find what you need? Post an RFQ and our sourcing team will find suppliers for you."
    >
      <PostRfqButton />
    </PageHero>
    <Categories showHeader={false} />
    <RfqBand />
  </Page>
);

export const HoReCaPage = () => (
  <Page title="HoReCa Sourcing">
    <PageHero
      eyebrow="Foodadda HoReCa"
      title="Procurement for Hotels, Restaurants, Cafés and Caterers"
      text="One place to source everyday requirements, from fresh produce and ingredients to packaged foods, kitchen essentials and equipment."
    >
      <PostRfqButton>Post a HoReCa Requirement</PostRfqButton>
    </PageHero>
    <Block title="Who We Serve">
      <IconCards items={[
        { icon: Hotel, title: "Hotels", desc: "Banquets, room service and all-day dining procurement." },
        { icon: ChefHat, title: "Restaurants & caterers", desc: "Regular kitchen supplies and event-based bulk orders." },
        { icon: Coffee, title: "Cafés & QSRs", desc: "Consistent ingredients, bakery, beverages and packaging." },
        { icon: School, title: "Institutional kitchens", desc: "Schools, hospitals, offices and industrial canteens." },
      ]} />
    </Block>
    <HoReCaSection showPageLink={false} />
    <RfqBand title="Have a recurring kitchen requirement?" text="Share it once and get comparable quotations from suitable suppliers." />
  </Page>
);

export const SourcingDeskPage = () => (
  <Page title="Sourcing Desk">
    <PageHero
      eyebrow="Foodadda Sourcing Desk"
      title="Managed Sourcing and Procurement Support"
      text="A human-assisted sourcing desk for food businesses. We qualify your requirement, match suitable suppliers, collect comparable quotations and help coordinate samples and orders."
    >
      <PostRfqButton>Share Your Requirement</PostRfqButton>
      <Button asChild size="lg" variant="outline" className={outlineNavy}>
        <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
      </Button>
    </PageHero>
    <Block title="What the Sourcing Desk Does">
      <IconCards items={DESK_SERVICES} />
    </Block>
    <Block title="From Requirement to Repeat Order" tone="bg-card">
      <ol data-stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Qualify", "We confirm product, quantity, specification, delivery and commercial intent."],
          ["Match", "We shortlist suitable suppliers by category, capability, MOQ and location."],
          ["Quote", "We collect price, MOQ, lead time, validity, payment terms and freight in one format."],
          ["Deliver", "We help coordinate samples, orders and follow-ups for repeat requirements."],
        ].map(([t, d], i) => (
          <li key={t} className="card-modern group p-6">
            <span className="text-sm font-bold text-primary">Step {i + 1}</span>
            <h3 className="font-semibold text-lg text-heading mt-1 mb-2 font-sans">{t}</h3>
            <p className="text-sm text-muted-foreground">{d}</p>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground mt-6">
        Posting an RFQ is free. If you'd like a fully managed sourcing assignment, our team will explain
        the scope and any service fee before work starts.
      </p>
    </Block>
    <RfqBand />
  </Page>
);

export const AboutPage = () => (
  <Page title="About Foodadda">
    <PageHero
      eyebrow="About Foodadda"
      title="Sourcing Simplified. Connecting India's Food Business Ecosystem."
      text="Foodadda is a B2B food sourcing platform connecting buyers, manufacturers, suppliers, distributors and HoReCa businesses across India. Our objective is simple: make food sourcing easier, faster and more efficient."
    >
      <PostRfqButton />
    </PageHero>
    <Block title="Our Story">
      <div className="max-w-3xl space-y-4 text-muted-foreground">
        <p>
          Food businesses told us the same thing: they don't need another directory, they need relevant
          business. Buyers want reliable suppliers who can meet their specification, and manufacturers want
          genuine enquiries.
        </p>
        <p>
          So Foodadda is built around the buyer's requirement. Buyers post an RFQ, our sourcing team qualifies
          it, and we connect it with suppliers who can actually fulfil it, then support the journey from
          quotation to sample to order. A smaller network that does real business is worth more than a large
          list of inactive registrations.
        </p>
      </div>
    </Block>
    <section id="verification" className="py-16 md:py-20 bg-card scroll-mt-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Verification Policy</h2>
        <p className="text-muted-foreground max-w-3xl mb-10">
          These are Foodadda review statuses, not certifications, and Foodadda does not certify suppliers.
          A status is shown only after a documented check, and we record who checked what and when.
          A certificate is never marked as verified just because a supplier uploaded it.
        </p>
        <IconCards items={VERIFICATION_STATUSES} />
      </div>
    </section>
    <Block title="Contact Us">
      <div data-stagger className="grid sm:grid-cols-3 gap-4 max-w-3xl">
        <a href={CONTACT.phoneHref} className="card-modern p-5">
          <p className="text-sm text-muted-foreground">Phone</p><p className="font-semibold text-heading">{CONTACT.phone}</p>
        </a>
        <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="card-modern p-5">
          <p className="text-sm text-muted-foreground">WhatsApp</p><p className="font-semibold text-heading">{CONTACT.phone}</p>
        </a>
        <a href={`mailto:${CONTACT.email}`} className="card-modern p-5">
          <p className="text-sm text-muted-foreground">Email</p><p className="font-semibold text-heading">{CONTACT.email}</p>
        </a>
      </div>
      <p className="text-sm text-muted-foreground mt-8 flex flex-wrap gap-x-5 gap-y-2">
        <Link to="/pricing" className="hover:text-primary">Membership & Pricing</Link>
        <Link to="/terms-and-conditions" className="hover:text-primary">Terms & Conditions</Link>
        <Link to="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
        <Link to="/refund-policy" className="hover:text-primary">Refund Policy</Link>
      </p>
    </Block>
  </Page>
);

export const PricingPage = () => (
  <Page title="Membership & Pricing">
    <PageHero
      eyebrow="Membership & Pricing"
      title="Free to Post. Free to Register."
      text="Buyers can post RFQs free, and basic supplier registration is free. Paid supplier memberships add profile, promotion and reporting features. Membership fees are separate from any managed sourcing service, and we explain any service fee before work starts."
    >
      <PostRfqButton />
    </PageHero>
    <Pricing />
    <TrustSection />
  </Page>
);

