import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  tag: string | null;
  status: string;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useBlogs(options?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: ['blogs', options],
    queryFn: async () => {
      let query = supabase.from('blogs').select('*').order('published_at', { ascending: false });
      if (options?.status) query = query.eq('status', options.status);
      if (options?.limit) query = query.limit(options.limit);
      const { data, error } = await query;
      if (error) throw error;
      return data as Blog[];
    },
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data as Blog;
    },
    enabled: !!slug,
  });
}

export function useBlogById(id: string) {
  return useQuery({
    queryKey: ['blog-id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Blog;
    },
    enabled: !!id && id !== 'new',
  });
}

export function useAdminBlogs() {
  return useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Blog[];
    },
  });
}

export function useSaveBlog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (blog: Partial<Blog> & { id?: string }) => {
      const payload = {
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        cover_image_url: blog.cover_image_url,
        tag: blog.tag,
        status: blog.status,
        published_at: blog.status === 'published' ? (blog.published_at || new Date().toISOString()) : blog.published_at,
      };

      if (blog.id) {
        const { data, error } = await supabase.from('blogs').update(payload).eq('id', blog.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('blogs').insert(payload).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast({ title: 'Blog saved successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error saving blog', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast({ title: 'Blog deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting blog', description: error.message, variant: 'destructive' });
    },
  });
}
