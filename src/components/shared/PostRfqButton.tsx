import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PostRequirementDialog } from "@/components/shared/PostRequirementDialog";

interface PostRfqButtonProps extends Omit<ButtonProps, "onClick"> {
  children?: ReactNode;
  showArrow?: boolean;
}

/** Primary "Post Your RFQ" call to action, used across the site. */
export function PostRfqButton({ children = "Post Your RFQ", showArrow = true, variant = "hero", size = "lg", ...props }: PostRfqButtonProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        {...props}
        onClick={() => (user ? setOpen(true) : navigate("/auth?tab=signup"))}
      >
        {children}
        {showArrow && <ArrowRight className="w-5 h-5" />}
      </Button>
      <PostRequirementDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
