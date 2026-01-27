import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin, CheckCircle, Package } from 'lucide-react';
import { SaveButton } from '@/components/buyer/SaveButton';
import { cn } from '@/lib/utils';

interface SupplierCardProps {
  id: string;
  companyName: string;
  businessDescription?: string | null;
  logoUrl?: string | null;
  city?: string | null;
  state?: string | null;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  productCount?: number;
  showSaveButton?: boolean;
  isSaved?: boolean;
  onSaveToggle?: () => void;
  className?: string;
}

export function SupplierCard({
  id,
  companyName,
  businessDescription,
  logoUrl,
  city,
  state,
  verificationStatus,
  productCount = 0,
  showSaveButton = true,
  isSaved = false,
  onSaveToggle,
  className,
}: SupplierCardProps) {
  const location = [city, state].filter(Boolean).join(', ');
  const isVerified = verificationStatus === 'verified';

  return (
    <Card className={cn("group overflow-hidden hover:shadow-lg transition-all duration-300", className)}>
      <Link to={`/suppliers/${id}`}>
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Store className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Verified Badge */}
          {isVerified && (
            <Badge
              className="absolute top-2 left-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link to={`/suppliers/${id}`}>
              <h3 className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors flex items-center gap-1">
                {companyName}
              </h3>
            </Link>
            
            {businessDescription && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {businessDescription}
              </p>
            )}
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {productCount} products
              </span>
            </div>
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
