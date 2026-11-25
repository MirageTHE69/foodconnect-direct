import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, LayoutDashboard, ScanLine, ChevronDown } from "lucide-react";
import logoImg from "@/assets/logo-nav.png";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostRfqButton } from "@/components/shared/PostRfqButton";

const NAV_LINKS = [
  { label: "Buyers", to: "/buyers" },
  { label: "Suppliers", to: "/for-suppliers" },
  { label: "Product Categories", to: "/categories" },
  { label: "HoReCa", to: "/horeca" },
  { label: "Sourcing Desk", to: "/sourcing-desk" },
];

const KNOWLEDGE_LINKS = [
  { label: "Articles & Insights", to: "/blog" },
  { label: "Recipes", to: "/recipes" },
  { label: "Jobs", to: "/jobs" },
  { label: "Scan a Product", to: "/scan" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-underline text-sm font-medium transition-colors whitespace-nowrap ${isActive ? "active text-primary" : "text-foreground/80 hover:text-primary"}`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium rounded-lg px-3 transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted"}`;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const close = () => setIsMenuOpen(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (userRole === 'supplier') return '/supplier/dashboard';
    if (userRole === 'admin') return '/admin';
    return '/buyer/dashboard';
  };

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMenuOpen ? "bg-white/85 backdrop-blur-xl border-b border-border shadow-[0_10px_30px_-15px_hsl(209_52%_19%/0.25)]" : "bg-white/50 backdrop-blur-md border-b border-transparent"}`}>
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between gap-4 transition-all duration-300 ${scrolled ? "h-16" : "h-16 md:h-20"}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" aria-label="Foodadda home">
            <img src={logoImg} alt="Foodadda Logo" className="h-12 md:h-14 w-auto rounded-lg" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary outline-none">
                Knowledge <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {KNOWLEDGE_LINKS.map((l) => (
                  <DropdownMenuItem key={l.to} onClick={() => navigate(l.to)}>
                    {l.to === "/scan" && <ScanLine className="mr-2 h-4 w-4" />}
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <NavLink to="/about" className={linkClass}>About Foodadda</NavLink>
          </div>

          {/* Desktop CTA */}
          <div className="hidden xl:flex items-center gap-2">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="Account menu">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {userRole || 'User'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                Log In
              </Button>
            )}
            <PostRfqButton size="sm" showArrow={false} className="h-10 px-5" />
          </div>

          {/* Mobile: RFQ stays visible next to the menu button */}
          <div className="flex xl:hidden items-center gap-2">
            <PostRfqButton size="sm" showArrow={false} className="h-9 px-3 text-xs sm:text-sm" />
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden py-4 border-t border-border max-h-[calc(100vh-4rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {[...NAV_LINKS, { label: "About Foodadda", to: "/about" }].map((l) => (
                <NavLink key={l.to} to={l.to} onClick={close} className={(s) => `${mobileLinkClass(s)} py-2.5`}>
                  {l.label}
                </NavLink>
              ))}
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-3 pb-1">Knowledge</p>
              {KNOWLEDGE_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={close} className={(s) => `${mobileLinkClass(s)} py-2 ml-2`}>
                  {l.label}
                </NavLink>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                {user ? (
                  <>
                    <Button variant="ghost" className="justify-center" onClick={() => { close(); navigate(getDashboardLink()); }}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="justify-center text-destructive" onClick={() => { close(); handleSignOut(); }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="justify-center" onClick={() => { close(); navigate('/auth'); }}>
                      Log In
                    </Button>
                    <Button variant="secondary" className="justify-center" onClick={() => { close(); navigate('/auth?tab=signup'); }}>
                      Join as a Supplier
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
