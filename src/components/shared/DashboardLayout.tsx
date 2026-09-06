import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  User,
  Package,
  MessageSquare,
  Heart,
  Search,
  Store,
  LogOut,
  Menu,
  X,
  ChefHat,
  BookOpen,
  ScanLine,
  Mail,
  Upload,
  FileText,
  CreditCard,
  Flame,
  Briefcase,
  Contact,
} from 'lucide-react';
import logoImg from '@/assets/logo-nav.png';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const unifiedNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Profile', href: '/profile', icon: <User className="h-5 w-5" /> },
  { label: 'My Products', href: '/supplier/products', icon: <Package className="h-5 w-5" /> },
  { label: 'My Recipes', href: '/supplier/recipes', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Browse Products', href: '/products', icon: <Search className="h-5 w-5" /> },
  { label: 'Browse Suppliers', href: '/suppliers', icon: <Store className="h-5 w-5" /> },
  { label: 'Browse Recipes', href: '/recipes', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Saved Items', href: '/saved', icon: <Heart className="h-5 w-5" /> },
  { label: 'Messages', href: '/chat', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Scan Product', href: '/scan', icon: <ScanLine className="h-5 w-5" /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Users', href: '/admin/users', icon: <User className="h-5 w-5" /> },
  { label: 'Suppliers', href: '/admin/suppliers', icon: <Store className="h-5 w-5" /> },
  { label: 'Products', href: '/admin/products', icon: <Package className="h-5 w-5" /> },
  { label: 'Import Suppliers', href: '/admin/import-suppliers', icon: <Upload className="h-5 w-5" /> },
  { label: 'Contact Submissions', href: '/admin/contact', icon: <Mail className="h-5 w-5" /> },
  { label: 'Blogs', href: '/admin/blogs', icon: <FileText className="h-5 w-5" /> },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Hot Requirements', href: '/admin/hot-requirements', icon: <Flame className="h-5 w-5" /> },
  { label: 'Jobs', href: '/admin/jobs', icon: <Briefcase className="h-5 w-5" /> },
  { label: 'Resumes & Skills', href: '/admin/talent', icon: <Contact className="h-5 w-5" /> },
  { label: 'Recipes', href: '/admin/recipes', icon: <BookOpen className="h-5 w-5" /> },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, userRole, signOut } = useAuth();
  const { planName, hasActiveSubscription } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = userRole === 'admin' ? adminNavItems : unifiedNavItems;

  const getRoleBadge = () => {
    if (userRole === 'admin') return { label: 'Admin', variant: 'destructive' as const };
    if (userRole === 'supplier') return { label: 'Supplier', variant: 'default' as const };
    return { label: 'Buyer', variant: 'secondary' as const };
  };

  const badge = getRoleBadge();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="FoodAdda Logo" className="h-8 w-auto rounded-lg" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-background border-r transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-2 px-6 border-b">
            <Link to="/" className="flex items-center gap-2">
<img src={logoImg} alt="FoodAdda Logo" className="h-8 w-auto rounded-lg" />
            </Link>
          </div>

          {/* User Info + Role Badge */}
          <div className="px-6 py-4 space-y-2">
            <div className="px-3 py-2 bg-primary/10 rounded-lg flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Badge variant={badge.variant} className="shrink-0 ml-2 text-xs">
                {badge.label}
              </Badge>
            </div>
            {userRole !== 'admin' && (
              <Link
                to="/profile"
                className="block px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors truncate"
              >
                Plan: <span className="font-medium text-foreground">{hasActiveSubscription && planName ? planName : 'Free / Guest'}</span>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
