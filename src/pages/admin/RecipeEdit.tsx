import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { PdfFlipbook } from '@/components/recipes/PdfFlipbook';
import { renderPdfFirstPageAsBlob } from '@/lib/pdfThumbnail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, ArrowLeft, FileUp, FileText } from 'lucide-react';
import { toast } from 'sonner';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timed out')), ms)),
  ]);
}

export default function AdminRecipeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    if (!isNew && id) loadRecipe(id);
  }, [id, isNew]);

  const loadRecipe = async (recipeId: string) => {
    setLoading(true);
    const { data: recipe } = await supabase.from('recipes').select('title, pdf_url, images').eq('id', recipeId).maybeSingle();
    if (recipe) {
      setTitle(recipe.title || '');
      setPdfUrl(recipe.pdf_url || '');
      setThumbnailUrl(recipe.images?.[0] || '');
    }
    setLoading(false);
  };

  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('PDF must be under 20MB');
      return;
    }
    setUploadingPdf(true);
    try {
      // Generate the thumbnail from the local file first and let it fully
      // finish (including releasing its pdf.js document) before the preview
      // flipbook below ever mounts. Both use the same shared pdf.js worker,
      // and letting them run concurrently was stalling the upload.
      let thumbBlob: Blob | null = null;
      try {
        thumbBlob = await withTimeout(renderPdfFirstPageAsBlob(file), 20000);
      } catch (thumbErr) {
        console.error('Thumbnail generation failed:', thumbErr);
      }

      const timestamp = Date.now();
      const pdfPath = `${user.id}/pdf-${timestamp}.pdf`;
      const { error } = await supabase.storage.from('recipes').upload(pdfPath, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('recipes').getPublicUrl(pdfPath);

      let thumbUrl = '';
      if (thumbBlob) {
        const thumbPath = `${user.id}/thumb-${timestamp}.jpg`;
        const { error: thumbUploadError } = await supabase.storage
          .from('recipes')
          .upload(thumbPath, thumbBlob, { upsert: true, contentType: 'image/jpeg' });
        if (thumbUploadError) {
          console.error('Thumbnail upload failed:', thumbUploadError);
        } else {
          thumbUrl = supabase.storage.from('recipes').getPublicUrl(thumbPath).data.publicUrl;
        }
      }

      setThumbnailUrl(thumbUrl);
      setPdfUrl(publicUrl);
      toast.success('Recipe PDF uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload PDF');
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfUrl) {
      toast.error('Please upload a recipe PDF');
      return;
    }
    setSaving(true);

    const recipeData = {
      title,
      pdf_url: pdfUrl,
      images: thumbnailUrl ? [thumbnailUrl] : null,
      status: 'approved',
      supplier_id: null,
    };

    try {
      if (isNew) {
        const { error } = await supabase.from('recipes').insert(recipeData);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('recipes').update(recipeData).eq('id', id);
        if (error) throw error;
      }

      toast.success(isNew ? 'Recipe published' : 'Recipe updated');
      navigate('/admin/recipes');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/recipes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isNew ? 'New Official Recipe' : 'Edit Recipe'}</h1>
            <p className="text-muted-foreground">Publishes directly to the Recipes page</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipe Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter recipe title"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recipe PDF</CardTitle>
              <CardDescription>Shown to visitors as a page-flip book.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfSelect}
                className="hidden"
                disabled={uploadingPdf}
              />
              <Button type="button" variant="outline" onClick={() => pdfInputRef.current?.click()} disabled={uploadingPdf}>
                {uploadingPdf ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
                ) : (
                  <><FileUp className="h-4 w-4 mr-2" />{pdfUrl ? 'Replace PDF' : 'Upload PDF'}</>
                )}
              </Button>
              {pdfUrl && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    PDF attached
                    <button type="button" onClick={() => { setPdfUrl(''); setThumbnailUrl(''); }} className="text-destructive hover:underline ml-2">
                      Remove
                    </button>
                  </div>
                  <PdfFlipbook url={pdfUrl} />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/recipes')}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploadingPdf}>
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />{isNew ? 'Publish Recipe' : 'Save Changes'}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
