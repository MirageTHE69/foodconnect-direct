import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import HowItWorks from "@/components/landing/HowItWorks";
import Categories from "@/components/landing/Categories";
import ForBuyers from "@/components/landing/ForBuyers";
import FeaturedSuppliers from "@/components/landing/FeaturedSuppliers";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import Community from "@/components/landing/Community";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Categories />
      <ForBuyers />
      <FeaturedSuppliers />
      <Pricing />
      <Testimonials />
      <Community />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
