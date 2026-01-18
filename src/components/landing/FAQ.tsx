import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const faqs = [
  {
    question: "Is FoodAdda free to use?",
    answer: "Yes! FoodAdda is completely free for buyers. Suppliers can list their business and products for free. We may introduce premium features in the future, but core functionality will always remain free.",
  },
  {
    question: "How are suppliers verified?",
    answer: "We verify suppliers through a multi-step process that includes FSSAI license verification, GST registration check, business documentation review, and in some cases, physical verification. Verified suppliers display a green verification badge.",
  },
  {
    question: "What categories of food products are available?",
    answer: "We cover 12+ categories including Grains & Cereals, Dairy Products, Fresh Produce, Meat & Poultry, Seafood, Spices & Condiments, Beverages, Frozen Foods, Bakery products, Oils & Fats, Packaged Foods, and Organic products.",
  },
  {
    question: "How do I contact a supplier?",
    answer: "Once you find a supplier you're interested in, you can send them an enquiry directly through the platform. You can also start a chat conversation for real-time communication. No phone numbers or emails are shared until both parties agree.",
  },
  {
    question: "Which cities does FoodAdda cover?",
    answer: "We currently have suppliers from 50+ cities across India, with strong presence in Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Ahmedabad, Kolkata, and other major food hubs. We're expanding rapidly to cover more regions.",
  },
  {
    question: "How do I become a supplier on FoodAdda?",
    answer: "Simply sign up as a supplier, complete your business profile with required documents (FSSAI, GST), add your products, and submit for verification. Once verified, your profile goes live and buyers can discover you.",
  },
];

const FAQ = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about FoodAdda. Can't find an answer? Contact us.
            </p>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="mb-10">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-left hover:text-primary hover:no-underline py-5">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact CTA */}
          <div className="text-center p-8 bg-muted/50 rounded-2xl border border-border/50">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help.
            </p>
            <Button variant="outline">
              <Mail className="w-4 h-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
