import { Building2, ShoppingCart, UtensilsCrossed, Store, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export type UserType = 'b2b' | 'b2c' | 'horeca' | 'franchise' | 'recruitment';

interface UserTypeOption {
  value: UserType;
  label: string;
  description: string;
  icon: React.ElementType;
}

const userTypes: UserTypeOption[] = [
  { value: 'b2b', label: 'B2B', description: 'Business to Business trading', icon: Building2 },
  { value: 'b2c', label: 'B2C', description: 'Business to Consumer sales', icon: ShoppingCart },
  { value: 'horeca', label: 'HoReCa', description: 'Hotel / Restaurant / Café / Catering', icon: UtensilsCrossed },
  { value: 'franchise', label: 'Franchise', description: 'Franchise opportunities', icon: Store },
  { value: 'recruitment', label: 'Recruitment', description: 'Job seekers in food industry', icon: Users },
];

interface UserTypeSelectorProps {
  selected: UserType | null;
  onSelect: (type: UserType) => void;
}

export function UserTypeSelector({ selected, onSelect }: UserTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground text-center">Select Your User Type</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {userTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onSelect(type.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
              selected === type.value
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/30 hover:bg-accent/50"
            )}
          >
            <type.icon className={cn("w-7 h-7", selected === type.value ? "text-primary" : "text-muted-foreground")} />
            <span className="font-semibold text-sm text-foreground">{type.label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{type.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
