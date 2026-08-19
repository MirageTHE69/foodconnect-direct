import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlogs } from '@/hooks/useBlogs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import logoImg from '@/assets/logo.png';

const Blog = () => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { data: blogs, isLoading } = useBlogs({ status: 'published' });

  const tags = [...new Set(blogs?.map(b => b.tag).filter(Boolean))];

  const filtered = blogs?.filter(b => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchTag = !selectedTag || b.tag === selectedTag;
    return matchSearch && matchTag;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="FoodAdda" className="h-8 w-auto" />
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">Blog</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Stay updated with the latest food industry insights, guides, and platform updates.
        </p>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedTag === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Button>
            {tags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(tag!)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl p-6 border animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered?.map(blog => (
              <Link
                key={blog.id}
                to={`/blog/${blog.slug}`}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                {blog.cover_image_url && (
                  <img src={blog.cover_image_url} alt={blog.title} loading="lazy" className="w-full h-40 object-cover rounded-xl mb-4" />
                )}
                {blog.tag && (
                  <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-0">
                    {blog.tag}
                  </Badge>
                )}
                <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{blog.excerpt}</p>
                {blog.published_at && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(blog.published_at), 'MMM d, yyyy')}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {filtered?.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-12">No blogs found.</p>
        )}
      </main>
    </div>
  );
};

export default Blog;
