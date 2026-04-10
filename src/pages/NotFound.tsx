import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, Film } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Film className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-7xl md:text-8xl font-black text-primary mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-10 max-w-md">
            This page doesn't exist or has been removed. Let's get you back to browsing.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/home">
              <Button size="lg" className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" size="lg" className="gap-2 border-border/30">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default NotFound;
