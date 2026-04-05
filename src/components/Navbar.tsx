import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, User, Menu, X, LogOut, Shield, Home, Compass, Film, HelpCircle } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "FAQ", href: "/changelog", icon: HelpCircle },
  { label: "Explore", href: "/genres", icon: Compass },
  { label: "Movies", href: "/movies", icon: Film },
];

export const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => checkAdminStatus(session.user.id), 0);
      } else {
        setIsAdmin(false);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdminStatus(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin");
    setIsAdmin(data && data.length > 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("activeViewerProfile");
    toast.success("Signed out successfully");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-surface-1 border-b border-border/50">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link to={user ? "/home" : "/"} className="flex-shrink-0">
              <Logo size="sm" />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors",
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-0.5">
              {/* Theme */}
              <ThemeToggle />

              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="h-4 w-4" />
                <span className="hidden md:inline">Search</span>
              </button>

              {user && <NotificationBell />}

              {user ? (
                <div className="flex items-center gap-0.5">
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Admin">
                        <Shield className="h-4 w-4 text-primary" />
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Profile">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="hidden md:flex h-8 w-8" onClick={handleSignOut} title="Sign Out">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link to="/" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Sign in</span>
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-muted-foreground hover:text-foreground"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-border/50 bg-surface-1 px-4 md:px-6 py-2.5">
            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-lg mx-auto">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search movies, TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-[55] bg-background/60 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-12 right-0 bottom-0 z-[56] w-[70%] max-w-xs bg-surface-1 border-l border-border/50 md:hidden overflow-y-auto">
            <div className="p-3 flex flex-col gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors",
                    isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-border/50 my-2" />
              {user ? (
                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-muted-foreground hover:text-foreground w-full text-left"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              ) : (
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mx-2 mt-2 py-2 rounded bg-primary text-primary-foreground font-medium text-center text-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
