import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { SubCategoryPicker } from '@/components/shared/SubCategoryPicker';

// Stable fallback so the reset effect below does not loop while loading.
const NO_IDS: string[] = [];

interface Props {
  supplierId: string;
  /** Shown under the picker. */
  hint?: string;
}

/** Edits which directory sub-categories a supplier is listed under. Saves on its own button. */
export function SupplierCategoriesEditor({ supplierId, hint }: Props) {
  const queryClient = useQueryClient();
  const queryKey = ['supplier-sub-categories', supplierId];
  const { data: saved = NO_IDS, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_sub_categories')
        .select('sub_category_id')
        .eq('supplier_id', supplierId);
      if (error) throw error;
      return (data ?? []).map((r) => r.sub_category_id);
    },
  });
  const [value, setValue] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setValue(saved); }, [saved]);

  const dirty = value.length !== saved.length || value.some((id) => !saved.includes(id));

  const save = async () => {
    setSaving(true);
    try {
      const removed = saved.filter((id) => !value.includes(id));
      const added = value.filter((id) => !saved.includes(id));
      if (removed.length) {
        const { error } = await supabase
          .from('supplier_sub_categories')
          .delete()
          .eq('supplier_id', supplierId)
          .in('sub_category_id', removed);
        if (error) throw error;
      }
      if (added.length) {
        const { error } = await supabase
          .from('supplier_sub_categories')
          .insert(added.map((id) => ({ supplier_id: supplierId, sub_category_id: id })));
        if (error) throw error;
      }
      await queryClient.invalidateQueries({ queryKey });
      toast.success('Categories saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save categories');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <SubCategoryPicker value={value} onChange={setValue} disabled={isLoading || saving} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <Button type="button" size="sm" onClick={save} disabled={!dirty || saving}>
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Save categories
      </Button>
    </div>
  );
}
