import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const blogPosts = [
  {
    title: "Top Food Industry Trends in 2026",
    excerpt: "Discover the latest trends shaping the food industry across India.",
    tag: "Industry",
  },
  {
    title: "How to Choose the Right Supplier",
    excerpt: "A comprehensive guide to evaluating and selecting food suppliers.",
    tag: "Guide",
  },
];

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Blogs &<br />Newsletters
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Stay updated with the latest food industry insights, supplier stories, 
              and platform updates delivered to your inbox.
            </p>
            <Button variant="hero" size="lg" onClick={() => navigate('/auth')}>
              Subscribe Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Right - Blog cards */}
          <div className="grid gap-6">
            {blogPosts.map((post) => (
              <div
                key={post.title}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
              >
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                  {post.tag}
                </span>
                <h3 className="text-lg font-bold text-foreground mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
