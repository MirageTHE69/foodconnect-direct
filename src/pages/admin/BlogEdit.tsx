import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useBlogById, useSaveBlog } from '@/hooks/useBlogs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const BlogEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const { data: existing, isLoading } = useBlogById(id || '');
  const saveBlog = useSaveBlog();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    tag: 'Industry',
    status: 'draft' as string,
    cover_image_url: '',
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        slug: existing.slug,
        excerpt: existing.excerpt || '',
        content: existing.content || '',
        tag: existing.tag || 'Industry',
        status: existing.status,
        cover_image_url: existing.cover_image_url || '',
      });
    }
  }, [existing]);

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: isNew ? slugify(title) : prev.slug,
    }));
  };

  const handleSave = () => {
    saveBlog.mutate(
      { ...form, id: isNew ? undefined : id },
      { onSuccess: () => navigate('/admin/blogs') }
    );
  };

  if (!isNew && isLoading) {
    return <DashboardLayout><div className="text-muted-foreground">Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blogs')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{isNew ? 'New Blog Post' : 'Edit Blog Post'}</h1>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Blog title" />
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="url-friendly-slug" />
        </div>

        <div className="space-y-2">
          <Label>Excerpt</Label>
          <Textarea value={form.excerpt} onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))} placeholder="Short summary for cards" rows={2} />
        </div>

        <div className="space-y-2">
          <Label>Content (HTML)</Label>
          <Textarea value={form.content} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))} placeholder="Full article content in HTML" rows={15} className="font-mono text-xs" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tag</Label>
            <Select value={form.tag} onValueChange={v => setForm(prev => ({ ...prev, tag: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Industry', 'Guide', 'News', 'Recipe', 'Update'].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cover Image URL</Label>
            <Input value={form.cover_image_url} onChange={e => setForm(prev => ({ ...prev, cover_image_url: e.target.value }))} placeholder="https://..." />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={form.status === 'published'} onCheckedChange={v => setForm(prev => ({ ...prev, status: v ? 'published' : 'draft' }))} />
          <Label>{form.status === 'published' ? 'Published' : 'Draft'}</Label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={saveBlog.isPending || !form.title || !form.slug}>
            <Save className="h-4 w-4 mr-2" /> {saveBlog.isPending ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/blogs')}>Cancel</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlogEdit;
