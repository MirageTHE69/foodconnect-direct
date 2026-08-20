import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

interface PublicPageLayoutProps {
  children: ReactNode;
}

// Used by pages that are browsable by guests (Suppliers/Products/Recipes
// listings) but were previously always wrapped in the logged-in dashboard
// shell. Guests now get the normal marketing Navbar/Footer; logged-in users
// still get their dashboard sidebar, same as before.
export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 md:pt-20">{children}</div>
      <Footer />
    </div>
  );
}
