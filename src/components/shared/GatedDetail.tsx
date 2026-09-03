import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import type { AccessLevel } from '@/lib/permissions';

interface GatedDetailProps {
  access: AccessLevel;
  /** Whether a 'limited' field has already been unlocked (via credits) this month. */
  unlocked?: boolean;
  onUnlock?: () => void;
  unlocking?: boolean;
  icon?: ReactNode;
  /** Shown for 'none' (upgrade prompt) and as the locked-state placeholder for 'limited'. */
  label: string;
  /** Shown instead of children when access === 'summary'. Falls back to label. */
  summary?: ReactNode;
  /** The real content, shown when access is 'full', or 'limited' + already unlocked. */
  children: ReactNode;
}

export function GatedDetail({ access, unlocked, onUnlock, unlocking, icon, label, summary, children }: GatedDetailProps) {
  if (access === 'full' || (access === 'limited' && unlocked)) {
    return <>{children}</>;
  }

  if (access === 'none') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span className="italic">{label} — upgrade to view</span>
      </div>
    );
  }

  if (access === 'summary') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{summary ?? label}</span>
      </div>
    );
  }

  // limited, not yet unlocked
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span className="blur-[3px] select-none text-muted-foreground">•••• •••• ••</span>
      <Button
        size="sm"
        variant="link"
        className="h-auto p-0 text-primary gap-1"
        onClick={onUnlock}
        disabled={unlocking}
      >
        {unlocking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
        {unlocking ? 'Unlocking...' : `Unlock ${label}`}
      </Button>
    </div>
  );
}
