import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlog, useBlogs } from '@/hooks/useBlogs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbSeparator, BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { ArrowLeft, ArrowRight, Calendar, Clock, Store, Package, LayoutGrid, ChefHat, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const EXPLORE_LINKS = [
  { label: 'Browse Suppliers', href: '/suppliers', icon: Store },
  { label: 'Browse Products', href: '/products', icon: Package },
  { label: 'All Categories', href: '/#categories', icon: LayoutGrid },
  { label: 'Recipes', href: '/recipes', icon: ChefHat },
  { label: 'View Pricing', href: '/subscribe', icon: Sparkles },
];

function readingTime(html: string | null): number {
  if (!html) return 1;
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading } = useBlog(slug || '');
  const { data: allBlogs } = useBlogs({ status: 'published' });

  useEffect(() => {
    if (!blog) return;
    document.title = `${blog.title} | FoodAdda Blog`;
    const desc = blog.excerpt || blog.title;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', desc);
  }, [blog]);

  const relatedPosts = useMemo(() => {
    if (!allBlogs || !blog) return [];
    const others = allBlogs.filter((b) => b.id !== blog.id);
    const sameTag = others.filter((b) => b.tag && b.tag === blog.tag);
    const rest = others.filter((b) => !sameTag.includes(b));
    return [...sameTag, ...rest].slice(0, 4);
  }, [allBlogs, blog]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Blog not found.</p>
          <Link to="/blog"><Button variant="hero">Back to Blogs</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="relative h-[340px] md:h-[440px] overflow-hidden">
          {blog.cover_image_url ? (
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 gradient-primary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

          <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-8 md:pb-12">
            {blog.tag && (
              <Badge className="mb-4 w-fit bg-primary text-primary-foreground border-none">{blog.tag}</Badge>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-white max-w-3xl leading-tight text-wrap-balance">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/80">
              {blog.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(blog.published_at), 'MMMM d, yyyy')}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {readingTime(blog.content)} min read
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/blog">Blog</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1 max-w-[240px]">{blog.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Article */}
          <article className="lg:col-span-2">
            <div
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: blog.content || '' }}
            />

            <div className="mt-12 pt-8 border-t">
              <Link to="/blog">
                <Button variant="hero">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to All Blogs
                </Button>
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-foreground mb-4">Explore FoodAdda</h3>
                <ul className="space-y-1">
                  {EXPLORE_LINKS.map(({ label, href, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        to={href}
                        className="flex items-center gap-3 py-2 px-2.5 -mx-2.5 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {relatedPosts.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-4">More from FoodAdda</h3>
                  <ul className="space-y-4">
                    {relatedPosts.map((post) => (
                      <li key={post.id}>
                        <Link to={`/blog/${post.slug}`} className="group flex gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {post.cover_image_url && (
                              <img src={post.cover_image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </p>
                            {post.published_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(post.published_at), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link to="/blog" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-4">
                    View all articles <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
