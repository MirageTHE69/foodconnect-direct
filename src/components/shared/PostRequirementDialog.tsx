import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface PostRequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialForm = { title: '', description: '', category: '', location: '', quantity: '', budget_range: '' };

export function PostRequirementDialog({ open, onOpenChange }: PostRequirementDialogProps) {
  const { user } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (next && !user) {
      onOpenChange(false);
      navigate('/auth');
      return;
    }
    if (next && can('post_sourcing_requirement') === 'none') {
      onOpenChange(false);
      toast({
        title: 'Upgrade required',
        description: 'Posting a sourcing requirement needs an active subscription plan.',
      });
      navigate('/subscribe');
      return;
    }
    onOpenChange(next);
    if (!next) setForm(initialForm);
  };

  const handleSubmit = async () => {
    if (!user || !form.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('hot_requirements').insert({
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      location: form.location.trim() || null,
      quantity: form.quantity.trim() || null,
      budget_range: form.budget_range.trim() || null,
      contact_user_id: user.id,
      is_active: false,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Requirement submitted', description: "We'll review it and publish it shortly." });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Post a Requirement</DialogTitle>
          <DialogDescription>
            Tell us what you need and we'll connect you with matching suppliers. Your requirement will be
            reviewed before it goes live.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="req-title">Title *</Label>
            <Input id="req-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Bulk organic spices supplier needed" />
          </div>
          <div>
            <Label htmlFor="req-description">Description</Label>
            <Textarea id="req-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe what you're looking for..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="req-category">Category</Label>
              <Input id="req-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Spices" />
            </div>
            <div>
              <Label htmlFor="req-location">Location</Label>
              <Input id="req-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Mumbai" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="req-quantity">Quantity</Label>
              <Input id="req-quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 500 kg/month" />
            </div>
            <div>
              <Label htmlFor="req-budget">Budget Range</Label>
              <Input id="req-budget" value={form.budget_range} onChange={(e) => setForm({ ...form, budget_range: e.target.value })} placeholder="e.g. ₹50,000-1,00,000" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || !form.title.trim()}>
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Requirement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
