import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const faqs = [
  {
    question: "Is FoodAdda free to use?",
    answer: "Yes! FoodAdda is completely free for buyers. Suppliers can list their business and products for free. We may introduce premium features in the future, but core functionality will always remain free.",
  },
  {
    question: "How are suppliers verified?",
    answer: "We verify suppliers through a multi-step process that includes FSSAI license verification, GST registration check, business documentation review, and in some cases, physical verification.",
  },
  {
    question: "What categories of food products are available?",
    answer: "We cover 12+ categories including Grains & Cereals, Dairy Products, Fresh Produce, Meat & Poultry, Seafood, Spices & Condiments, Beverages, Frozen Foods, Bakery products, Oils & Fats, Packaged Foods, and Organic products.",
  },
  {
    question: "How do I contact a supplier?",
    answer: "Once you find a supplier you're interested in, you can send them an enquiry directly through the platform or start a chat conversation for real-time communication.",
  },
  {
    question: "Which cities does FoodAdda cover?",
    answer: "We currently have suppliers from 50+ cities across India, with strong presence in Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, and other major food hubs.",
  },
  {
    question: "How do I become a supplier on FoodAdda?",
    answer: "Simply sign up as a supplier, complete your business profile with required documents (FSSAI, GST), add your products, and submit for verification.",
  },
  {
    question: "How does FoodAdda's subscription model work?",
    answer: "Suppliers choose a Business Category (Founders, Women Enterprise, North East Startups, Micro & First-Time Startups, or Small Homemade Food) at signup — each has its own category-credit plan and pricing. You can also upgrade to a Universal Tier (B2B & B2C, Business Growth, or Business Pro) for flat-fee, category-independent full access.",
  },
  {
    question: 'What does a "credit" unlock?',
    answer: "On a category-credit plan, 1 credit unlocks 1 supplier's full company details (contact info, full catalogue, certifications) for the month. Credits reset monthly and don't roll over. Universal Tier plans have no credit limit — full access to every supplier.",
  },
  {
    question: "Is annual billing cheaper than monthly?",
    answer: "Yes — every paid plan offers annual billing at 12× the monthly price for 13 months of access, so you effectively get 1 month free compared to paying monthly all year.",
  },
  {
    question: "Can I upgrade from a category plan to a Universal Tier later?",
    answer: "Yes, anytime from your dashboard's Upgrade Plan page. A Universal Tier overrides your category's credit limit with full, unlimited access regardless of your business category.",
  },
  {
    question: "How long does it take for my plan to be activated?",
    answer: "After you submit a plan request, an admin reviews and confirms payment, typically within one business day. You can keep using FoodAdda on your current access level while your request is pending.",
  },
  {
    question: "How does buyer-supplier chat work?",
    answer: "Once you've sent an enquiry or started a conversation with a supplier, you can message them directly and in real time from the Chat section of your dashboard.",
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FAQ = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  // Honeypot: real visitors never see or fill this field; bots that
  // auto-fill every input will, so we silently drop the submission.
  const [website, setWebsite] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (website.trim()) {
      // Looks like a bot — pretend success without writing anything.
      toast({ title: "Message sent!", description: "We'll get back to you as soon as possible." });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setWebsite("");
      return;
    }

    if (formData.name.trim().length < 2) {
      toast({ title: "Invalid name", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    if (!EMAIL_REGEX.test(formData.email.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (formData.subject.trim().length < 3) {
      toast({ title: "Invalid subject", description: "Please enter a short subject line.", variant: "destructive" });
      return;
    }
    if (formData.message.trim().length < 10) {
      toast({ title: "Invalid message", description: "Please enter at least 10 characters.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setWebsite("");
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about FoodAdda.
            </p>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="mb-12">
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

          {/* Contact Form */}
          <div className="p-8 bg-background rounded-2xl border border-border/50">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Still have questions?</h3>
              <p className="text-muted-foreground text-sm">We're here to help.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot field — hidden from real users, catches bots */}
              <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
                <Label htmlFor="contact-website">Website</Label>
                <Input
                  id="contact-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isSubmitting}
                    maxLength={255}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input
                  id="contact-subject"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  disabled={isSubmitting}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  placeholder="Tell us more..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  disabled={isSubmitting}
                  maxLength={2000}
                />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
