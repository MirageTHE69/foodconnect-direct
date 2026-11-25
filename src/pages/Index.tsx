import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Categories from "@/components/landing/Categories";
import ForBuyers from "@/components/landing/ForBuyers";
import ForSuppliers from "@/components/landing/ForSuppliers";
import FeaturedSuppliers from "@/components/landing/FeaturedSuppliers";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import HotRequirements from "@/components/landing/HotRequirements";
import { HoReCaSection, SourcingDeskSection, TrustSection, CategoryMarquee } from "@/components/landing/SourcingSections";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

// Section order follows the Foodadda 2.0 brief: buyer-first, RFQ-led.
const Index = () => {
  return (
    <div className="min-h-screen" data-reveal-root>
      <Navbar />
      <Hero />
      <CategoryMarquee />
      <HowItWorks />
      <Categories limit={8} />
      <ForBuyers />
      <ForSuppliers />
      <FeaturedProducts />
      <FeaturedSuppliers />
      <HotRequirements />
      <HoReCaSection />
      <SourcingDeskSection />
      <CTA />
      <TrustSection />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
