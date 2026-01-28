import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
}

interface IngredientInputProps {
  ingredientName: string;
  quantity: string;
  unit: string;
  productId: string | null;
  products: Product[];
  onUpdate: (field: 'ingredient_name' | 'quantity' | 'unit' | 'product_id', value: string | null) => void;
  onRemove: () => void;
}

export function IngredientInput({
  ingredientName,
  quantity,
  unit,
  productId,
  products,
  onUpdate,
  onRemove,
}: IngredientInputProps) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-[2]">
        <Input
          value={ingredientName}
          onChange={(e) => onUpdate('ingredient_name', e.target.value)}
          placeholder="Ingredient name"
        />
      </div>
      <div className="w-20">
        <Input
          value={quantity}
          onChange={(e) => onUpdate('quantity', e.target.value)}
          placeholder="Qty"
        />
      </div>
      <div className="w-24">
        <Input
          value={unit}
          onChange={(e) => onUpdate('unit', e.target.value)}
          placeholder="Unit"
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <Select
          value={productId || 'none'}
          onValueChange={(value) => onUpdate('product_id', value === 'none' ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Link product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No link</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive flex-shrink-0"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
