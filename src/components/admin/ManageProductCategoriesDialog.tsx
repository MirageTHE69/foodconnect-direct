import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

type ProductCategory = Tables<'product_categories'>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ProductCategory[];
  productCounts: Record<string, number>;
}

export function ManageProductCategoriesDialog({ open, onOpenChange, categories, productCounts }: Props) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };

  const exists = (name: string, exceptId?: string) =>
    categories.some((c) => c.id !== exceptId && c.name.trim().toLowerCase() === name.trim().toLowerCase());

  const add = async () => {
    const name = newName.trim();
    if (!name) return;
    if (exists(name)) { toast.error('A category with this name already exists'); return; }
    setBusy('new');
    const { error } = await supabase.from('product_categories').insert({ name });
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    setNewName('');
    toast.success(`Added "${name}"`);
    refresh();
  };

  const rename = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    if (exists(name, id)) { toast.error('A category with this name already exists'); return; }
    setBusy(id);
    const { error } = await supabase.from('product_categories').update({ name }).eq('id', id);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    setEditingId(null);
    toast.success('Category renamed');
    refresh();
  };

  const remove = async (category: ProductCategory) => {
    const count = productCounts[category.id] ?? 0;
    const warning = count > 0
      ? `Delete "${category.name}"? Its ${count} product${count === 1 ? '' : 's'} will become Uncategorized.`
      : `Delete "${category.name}"?`;
    if (!confirm(warning)) return;
    setBusy(category.id);
    const { error } = await supabase.from('product_categories').delete().eq('id', category.id);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success('Category deleted');
    refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage product categories</DialogTitle>
          <DialogDescription>
            Add, rename or remove the categories suppliers choose from. To move a single product, change its category in the table.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); add(); }} className="flex gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category name" maxLength={80} />
          <Button type="submit" disabled={!newName.trim() || busy === 'new'}>
            {busy === 'new' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}Add
          </Button>
        </form>

        <ul className="border rounded-lg divide-y">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-2 px-3 py-2">
              {editingId === c.id ? (
                <form onSubmit={(e) => { e.preventDefault(); rename(c.id); }} className="flex flex-1 items-center gap-2">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={80} className="h-8" autoFocus />
                  <Button type="submit" size="icon" variant="ghost" className="h-8 w-8" aria-label="Save name" disabled={busy === c.id}>
                    {busy === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label="Cancel" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {productCounts[c.id] ?? 0} product{(productCounts[c.id] ?? 0) === 1 ? '' : 's'}
                  </span>
                  <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Rename ${c.name}`}
                    onClick={() => { setEditingId(c.id); setEditName(c.name); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" aria-label={`Delete ${c.name}`}
                    onClick={() => remove(c)} disabled={busy === c.id}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
