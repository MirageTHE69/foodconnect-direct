import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface VendorAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: 'guest' | 'unsubscribed' | null;
}

export function VendorAccessDialog({ open, onOpenChange, reason }: VendorAccessDialogProps) {
  const navigate = useNavigate();
  const isGuest = reason !== 'unsubscribed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            {isGuest ? 'Sign up to see vendor details' : 'Choose a plan to see vendor details'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isGuest
              ? 'Sign up and get 1 month free with full access to vendor names and contact details, or log in.'
              : 'Vendor names and contact details need an active plan. Choose a plan to see them.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:flex-col gap-2 sm:space-x-0">
          {isGuest ? (
            <>
              <Button size="lg" className="w-full" onClick={() => navigate('/auth?tab=signup')}>Sign Up Free</Button>
              <Button size="lg" variant="ghost" className="w-full text-foreground" onClick={() => navigate('/auth')}>
                Already have an account? Log in
              </Button>
            </>
          ) : (
            <Button size="lg" className="w-full" onClick={() => navigate('/subscribe')}>View Plans</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
