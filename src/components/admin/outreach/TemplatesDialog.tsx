import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { OutreachTemplate } from '@/lib/outreach';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY = { id: '', name: '', subject: '', body: '' };

export function TemplatesDialog({ open, onOpenChange }: Props) {
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [editing, setEditing] = useState<typeof EMPTY | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('outreach_email_templates').select('*').order('created_at');
    setTemplates(data ?? []);
  };

  useEffect(() => {
    if (open) {
      setEditing(null);
      load();
    }
  }, [open]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const values = { name: editing.name.trim(), subject: editing.subject.trim(), body: editing.body.trim() };
    const { error } = editing.id
      ? await supabase.from('outreach_email_templates').update({ ...values, updated_at: new Date().toISOString() }).eq('id', editing.id)
      : await supabase.from('outreach_email_templates').insert(values);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Template saved');
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    const { error } = await supabase.from('outreach_email_templates').delete().eq('id', id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? (editing.id ? 'Edit template' : 'New template') : 'Email templates'}</DialogTitle>
          <DialogDescription>Reusable emails you can pick when sending. You can still edit the text before each send.</DialogDescription>
        </DialogHeader>

        {editing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tpl-name">Template name</Label>
              <Input id="tpl-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} maxLength={80} className="mt-1" placeholder="e.g. Supplier invitation" />
            </div>
            <div>
              <Label htmlFor="tpl-subject">Subject</Label>
              <Input id="tpl-subject" value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} maxLength={200} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="tpl-body">Message</Label>
              <Textarea id="tpl-body" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={10} maxLength={10000} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">
                Use {'{{name}}'}, {'{{business_type}}'}, {'{{company}}'} or {'{{city}}'} for each lead's own details.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Back</Button>
              <Button onClick={save} disabled={saving || !editing.name.trim() || !editing.subject.trim() || !editing.body.trim()}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save template
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{t.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{t.subject}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="icon" aria-label="Edit template" onClick={() => setEditing({ id: t.id, name: t.name, subject: t.subject, body: t.body })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Delete template" onClick={() => remove(t.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {templates.length === 0 && <p className="text-sm text-muted-foreground">No templates yet.</p>}
            <Button variant="outline" onClick={() => setEditing({ ...EMPTY })}>
              <Plus className="h-4 w-4 mr-2" />New template
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
