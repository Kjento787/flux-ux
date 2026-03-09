import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, Film } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Navbar />

        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[140px]" />
        {/* Film grain */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        }} />

        <main className="relative flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="w-28 h-28 mx-auto mb-6 rounded-3xl bg-primary/10 flex items-center justify-center shadow-glow">
              <Film className="h-14 w-14 text-primary" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-7xl md:text-8xl font-black text-primary mb-4 font-display"
          >
            404
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-2xl md:text-3xl font-bold mb-4 font-display"
          >
            Scene Not Found
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-muted-foreground mb-10 max-w-md"
          >
            This page doesn't exist or the reel has been cut. Let's get you back to the show.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Link to="/home">
              <Button size="lg" className="rounded-xl gap-2 shadow-glow px-8 font-bold uppercase tracking-wider text-sm">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" size="lg" className="rounded-xl gap-2 border-border/40 px-8">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </Link>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default NotFound;
