import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ChefHat, Users } from 'lucide-react';

interface RecipeCardProps {
  id: string;
  title: string;
  description?: string | null;
  images?: string[] | null;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
  difficulty?: string | null;
  supplierName?: string;
  supplierId?: string;
}

export function RecipeCard({
  id,
  title,
  description,
  images,
  prepTime,
  cookTime,
  servings,
  difficulty,
  supplierName,
  supplierId,
}: RecipeCardProps) {
  const totalTime = (prepTime || 0) + (cookTime || 0);
  
  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/recipes/${id}`}>
        <div className="aspect-video relative overflow-hidden bg-muted">
          {images && images[0] ? (
            <img
              src={images[0]}
              alt={title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          {difficulty && (
            <Badge
              className={`absolute top-2 right-2 ${getDifficultyColor(difficulty)}`}
            >
              {difficulty}
            </Badge>
          )}
        </div>
      </Link>
      
      <CardContent className="pt-4">
        <Link to={`/recipes/${id}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
        </Link>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
        
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {totalTime} min
            </span>
          )}
          {servings && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {servings} servings
            </span>
          )}
        </div>
      </CardContent>
      
      {supplierName && (
        <CardFooter className="pt-0">
          <Link
            to={supplierId ? `/suppliers/${supplierId}` : '#'}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            By {supplierName}
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
