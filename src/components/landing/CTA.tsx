import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useBlogs } from "@/hooks/useBlogs";
import { format } from "date-fns";

const CTA = () => {
  const navigate = useNavigate();
  const { data: blogs } = useBlogs({ status: 'published', limit: 2 });

  return (
    <section id="knowledge" className="py-20 md:py-24 bg-fresh scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Knowledge & Community
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Articles on food manufacturing, product development, food safety, recipes, founder
              stories and industry insights from the Foodadda community.
            </p>
            <Button variant="hero" size="lg" onClick={() => navigate('/blog')}>
              Visit the Knowledge Centre
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Right - Blog cards */}
          <div className="grid gap-6" data-stagger>
            {(blogs && blogs.length > 0 ? blogs : [
              { id: '1', title: 'Top Food Industry Trends in 2026', excerpt: 'Discover the latest trends shaping the food industry across India.', tag: 'Industry', slug: '', published_at: null },
              { id: '2', title: 'How to Choose the Right Supplier', excerpt: 'A comprehensive guide to evaluating and selecting food suppliers.', tag: 'Guide', slug: '', published_at: null },
            ]).map((post) => (
              <Link
                key={post.id}
                to={post.slug ? `/blog/${post.slug}` : '/blog'}
                className="card-modern p-6 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                    {post.tag}
                  </Badge>
                  {post.published_at && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(post.published_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
