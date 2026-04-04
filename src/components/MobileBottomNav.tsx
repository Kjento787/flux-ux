import { Home, Search, Film, Bookmark, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { icon: Home, label: "Home", href: "/home" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Film, label: "Movies", href: "/movies" },
  { icon: Bookmark, label: "My List", href: "/profile" },
  { icon: User, label: "Profile", href: "/profile" },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
    });
  }, []);

  const hiddenRoutes = ["/", "/auth", "/banned", "/profiles"];
  if (hiddenRoutes.includes(location.pathname)) return null;
  if (!isAuthenticated) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-1 border-t border-border/50">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5"
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
