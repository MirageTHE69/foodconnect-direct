import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface SubCategoryOption {
  id: string;
  name: string;
  categoryName: string;
}

/** The directory's categories and sub-categories, as shown on the Categories pages. */
export function useDirectoryTaxonomy() {
  return useQuery({
    queryKey: ['directory-taxonomy'],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<SubCategoryOption[]> => {
      const [catsRes, subsRes] = await Promise.all([
        supabase.from('categories').select('id, name, display_order').order('display_order'),
        supabase.from('sub_categories').select('id, name, category_id, display_order').order('display_order').range(0, 1999),
      ]);
      if (catsRes.error) throw catsRes.error;
      if (subsRes.error) throw subsRes.error;
      const cats = catsRes.data ?? [];
      const order = new Map(cats.map((c, i) => [c.id, i]));
      const names = new Map(cats.map((c) => [c.id, c.name]));
      return (subsRes.data ?? [])
        .filter((s) => names.has(s.category_id))
        .sort((a, b) => (order.get(a.category_id)! - order.get(b.category_id)!) || (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((s) => ({ id: s.id, name: s.name, categoryName: names.get(s.category_id)! }));
    },
  });
}

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  max?: number;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
}

export function SubCategoryPicker({ value, onChange, max = 5, placeholder = 'Choose what you deal in', invalid, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const { data: options = [], isLoading } = useDirectoryTaxonomy();

  const groups = useMemo(() => {
    const map = new Map<string, SubCategoryOption[]>();
    for (const o of options) map.set(o.categoryName, [...(map.get(o.categoryName) ?? []), o]);
    return Array.from(map.entries());
  }, [options]);

  const selected = value.map((id) => options.find((o) => o.id === id)).filter((o): o is SubCategoryOption => !!o);
  const full = value.length >= max;

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else if (!full) onChange([...value, id]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal border-input text-left hover:bg-background hover:text-foreground',
              invalid && 'border-destructive',
            )}
          >
            <span className={cn('truncate', !value.length && 'text-muted-foreground')}>
              {value.length ? `${value.length} selected (up to ${max})` : placeholder}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[280px] p-0" align="start">
          <Command
            // Plain word matching: cmdk's default fuzzy match pulls in unrelated items.
            filter={(itemValue, search) =>
              search.toLowerCase().split(/\s+/).filter(Boolean).every((w) => itemValue.toLowerCase().includes(w)) ? 1 : 0
            }
          >
            <CommandInput placeholder="Search e.g. spices, bakery, packaging" />
            <CommandList className="max-h-72">
              <CommandEmpty>{isLoading ? 'Loading…' : 'No matching category.'}</CommandEmpty>
              {groups.map(([category, subs]) => (
                <CommandGroup key={category} heading={category}>
                  {subs.map((s) => {
                    const checked = value.includes(s.id);
                    return (
                      <CommandItem
                        key={s.id}
                        value={`${s.name} ${category}`}
                        onSelect={() => toggle(s.id)}
                        disabled={!checked && full}
                      >
                        <Check className={cn('mr-2 h-4 w-4', checked ? 'opacity-100' : 'opacity-0')} />
                        {s.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <Badge key={s.id} variant="secondary" className="gap-1 pr-1 font-normal">
              <span className="text-muted-foreground">{s.categoryName} ›</span> {s.name}
              {!disabled && (
                <button type="button" onClick={() => toggle(s.id)} className="ml-0.5 rounded hover:bg-background/60 p-0.5" aria-label={`Remove ${s.name}`}>
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
