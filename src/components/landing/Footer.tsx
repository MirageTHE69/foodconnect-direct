import { Instagram, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAnchorNav } from "@/hooks/useAnchorNav";

const COMPANY_INFO = {
  address: "337, 3rd Floor, Infinity Arcade, Pratap Nagar Bridge, Pratap Nagar, Vadodara - 390004",
  phone: "+91 93281 37674",
  phoneHref: "+919328137674",
  email: "info@foodadda.in",
};

const Footer = () => {
  const goToAnchor = useAnchorNav();

  const footerLinks = {
    platform: [
      { name: "For Buyers", to: "/buyers" },
      { name: "For Suppliers", to: "/for-suppliers" },
      { name: "Product Categories", to: "/categories" },
      { name: "HoReCa", to: "/horeca" },
      { name: "Sourcing Desk", to: "/sourcing-desk" },
    ],
    services: [
      { name: "Find Suppliers", to: "/suppliers" },
      { name: "Browse Products", to: "/products" },
      { name: "Articles & Insights", to: "/blog" },
      { name: "Recipes", to: "/recipes" },
      { name: "Jobs", to: "/jobs" },
    ],
    company: [
      { name: "About Foodadda", to: "/about" },
      { name: "Verification Policy", to: "/about#verification" },
      { name: "Membership & Pricing", to: "/pricing" },
      { name: "Contact", anchor: "#contact" },
    ],
    legal: [
      { name: "Privacy Policy", to: "/privacy-policy" },
      { name: "Terms & Conditions", to: "/terms-and-conditions" },
      { name: "Refund Policy", to: "/refund-policy" },
      { name: "Disclaimer", to: "/disclaimer" },
      { name: "Blog Disclaimer", to: "/blog-disclaimer" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/foodadda_hub/", label: "Instagram" },
  ];

  const renderLink = (link: any) => {
    if (link.to) {
      return (
        <Link to={link.to} className="text-secondary-foreground/60 hover:text-white transition-colors text-sm">
          {link.name}
        </Link>
      );
    }
    return (
      <a
        href={link.anchor}
        onClick={goToAnchor(link.anchor)}
        className="text-secondary-foreground/60 hover:text-white transition-colors text-sm"
      >
        {link.name}
      </a>
    );
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-secondary-foreground">
                Food<span className="text-brand-orange">adda</span>
              </span>
            </Link>
            <p className="text-secondary-foreground/60 mb-6 max-w-sm text-sm">
              Sourcing Simplified. A B2B food sourcing platform connecting buyers,
              manufacturers, suppliers, distributors and HoReCa businesses across India.
            </p>
            <div className="space-y-2 mb-6 text-sm text-secondary-foreground/60">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{COMPANY_INFO.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a href={`tel:${COMPANY_INFO.phoneHref}`} className="hover:text-white transition-colors">{COMPANY_INFO.phone}</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-white transition-colors">{COMPANY_INFO.email}</a>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-white-foreground transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Platform", items: footerLinks.platform },
            { title: "Explore", items: footerLinks.services },
            { title: "Company", items: footerLinks.company },
            { title: "Legal", items: footerLinks.legal },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold mb-4 text-secondary-foreground">{col.title}</h4>
              <ul className="space-y-3">
                {col.items.map((link) => (
                  <li key={link.name}>{renderLink(link)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 text-center">
          <p className="text-sm text-secondary-foreground/40">
            © {new Date().getFullYear()} Foodadda – Sourcing Simplified. Discover. Connect. Source. Grow.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
