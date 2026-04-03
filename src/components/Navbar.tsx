import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, User, Menu, X, LogOut, Shield, Bookmark, Film, Tv, Compass, TrendingUp, Users, Gamepad2 } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";

const navItems = [
  { label: "Home", href: "/home", icon: Film },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "Series", href: "/genres", icon: Tv },
  { label: "Explore", href: "/hubs", icon: Compass },
  { label: "Trending", href: "/trending", icon: TrendingUp },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
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
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-card/95 backdrop-blur-md shadow-sm border-b border-border/50"
            : "bg-background/80 backdrop-blur-sm"
        )}
      >
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-14">
            <Logo size="sm" />

            {/* Desktop Nav - simple text links like KissKH */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5",
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1">
              {/* Search toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="h-9 w-9 rounded-md"
              >
                <Search className="h-4 w-4" />
              </Button>

              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              {user && <NotificationBell />}

              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md" title="Admin">
                        <Shield className="h-4 w-4 text-primary" />
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md" title="Profile">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex h-9 w-9 rounded-md"
                    onClick={handleSignOut}
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Link to="/">
                  <Button variant="ghost" className="hidden md:flex h-9 px-4 rounded-md text-sm font-medium">
                    <User className="h-4 w-4 mr-1.5" />
                    Sign in
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 rounded-md"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Inline Search Bar */}
        {searchOpen && (
          <div className="border-t border-border/50 bg-card/95 backdrop-blur-md px-4 md:px-8 py-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-xl mx-auto">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search movies, TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[55] bg-background/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-14 right-0 bottom-0 z-[56] w-[75%] max-w-xs bg-card border-l border-border md:hidden overflow-y-auto">
            <div className="p-4">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                      isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}

                <Link
                  to="/parties"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  <Users className="h-4 w-4" /> Watch Parties
                </Link>
                <Link
                  to="/leaderboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  <Gamepad2 className="h-4 w-4" /> Leaderboard
                </Link>

                <div className="h-px bg-border my-2" />

                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>

                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-primary hover:bg-primary/5"
                      >
                        <Shield className="h-4 w-4" /> Admin
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      <Bookmark className="h-4 w-4" /> My List
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent w-full text-left"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mx-2 mt-3 py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-center text-sm"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
