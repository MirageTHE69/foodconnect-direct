import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { SaveButton } from '@/components/buyer/SaveButton';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string | null;
  images?: string[] | null;
  supplierName?: string;
  supplierId?: string;
  categoryName?: string;
  status?: 'pending' | 'approved' | 'rejected';
  showSaveButton?: boolean;
  isSaved?: boolean;
  onSaveToggle?: () => void;
  className?: string;
}

export function ProductCard({
  id,
  name,
  description,
  images,
  supplierName,
  supplierId,
  categoryName,
  status,
  showSaveButton = true,
  isSaved = false,
  onSaveToggle,
  className,
}: ProductCardProps) {
  const imageUrl = images?.[0] || null;

  return (
    <Card className={cn("group overflow-hidden hover:shadow-lg transition-all duration-300", className)}>
      <Link to={`/products/${id}`}>
        <div className="aspect-square relative overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Status Badge */}
          {status && status !== 'approved' && (
            <Badge
              variant={status === 'pending' ? 'secondary' : 'destructive'}
              className="absolute top-2 left-2"
            >
              {status}
            </Badge>
          )}
          
          {/* Category Badge */}
          {categoryName && (
            <Badge
              variant="secondary"
              className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm"
            >
              {categoryName}
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link to={`/products/${id}`}>
              <h3 className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors">
                {name}
              </h3>
            </Link>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>
            )}
            {supplierName && (
              <Link 
                to={`/suppliers/${supplierId}`}
                className="text-xs text-primary hover:underline mt-1 block"
              >
                by {supplierName}
              </Link>
            )}
          </div>
          
          {showSaveButton && onSaveToggle && (
            <SaveButton
              isSaved={isSaved}
              onToggle={onSaveToggle}
              size="sm"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
