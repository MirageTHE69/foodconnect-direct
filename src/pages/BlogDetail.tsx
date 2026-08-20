import { useParams, Link } from 'react-router-dom';
import { useBlog } from '@/hooks/useBlogs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading } = useBlog(slug || '');

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

      <main className="container mx-auto px-4 pt-28 pb-16 md:pt-32 max-w-3xl">
        <div className="mb-6">
          {blog.tag && (
            <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-primary/20">
              {blog.tag}
            </Badge>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{blog.title}</h1>
          {blog.published_at && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(blog.published_at), 'MMMM d, yyyy')}
            </div>
          )}
        </div>

        {blog.cover_image_url && (
          <img src={blog.cover_image_url} alt={blog.title} loading="lazy" className="w-full h-64 md:h-80 object-cover rounded-2xl mb-8 shadow-card" />
        )}

        <article
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: blog.content || '' }}
        />

        <div className="mt-12 pt-8 border-t">
          <Link to="/blog">
            <Button variant="hero">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to All Blogs
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
