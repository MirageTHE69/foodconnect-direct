import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveButtonProps {
  isSaved: boolean;
  onToggle: () => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline';
  className?: string;
  disabled?: boolean;
}

export function SaveButton({
  isSaved,
  onToggle,
  size = 'default',
  variant = 'ghost',
  className,
  disabled = false,
}: SaveButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      className={cn(
        sizeClasses[size],
        "rounded-full transition-all duration-200",
        isSaved && "text-red-500 hover:text-red-600",
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          isSaved && "fill-current"
        )}
      />
    </Button>
  );
}
