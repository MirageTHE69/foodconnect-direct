import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  userId: string | null;
  label: string;
  accept?: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}

export function FileUpload({ userId, label, accept = 'image/*', currentUrl, onUpload, onRemove, className }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 10MB', variant: 'destructive' });
      return;
    }

    // Use a temporary folder if no userId yet
    const folder = userId || 'temp';
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

    setUploading(true);
    try {
      const { error } = await supabase.storage.from('registration_files').upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('registration_files').getPublicUrl(fileName);
      onUpload(publicUrl);
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input ref={fileInputRef} type="file" accept={accept} onChange={handleUpload} className="hidden" disabled={uploading} />
      {currentUrl ? (
        <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50">
          {accept.includes('image') ? (
            <img src={currentUrl} alt={label} className="w-12 h-12 rounded object-cover" />
          ) : (
            <FileText className="w-8 h-8 text-muted-foreground" />
          )}
          <span className="text-xs text-foreground truncate flex-1">Uploaded</span>
          {onRemove && (
            <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={onRemove}>
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          {label}
        </Button>
      )}
    </div>
  );
}
