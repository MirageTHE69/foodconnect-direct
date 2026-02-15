import { useParams, Link } from 'react-router-dom';
import { useBlog } from '@/hooks/useBlogs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import logoImg from '@/assets/logo.png';

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading } = useBlog(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Blog not found.</p>
        <Link to="/blog"><Button variant="outline">Back to Blogs</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="FoodAdda" className="h-8 w-auto" />
          </Link>
          <Link to="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> All Blogs
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-6">
          {blog.tag && (
            <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-0">
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
          <img src={blog.cover_image_url} alt={blog.title} className="w-full h-64 md:h-80 object-cover rounded-2xl mb-8" />
        )}

        <article
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: blog.content || '' }}
        />

        <div className="mt-12 pt-8 border-t">
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to All Blogs
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default BlogDetail;
