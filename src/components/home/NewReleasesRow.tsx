import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NewReleasesRowProps {
  title?: string;
  movies: Movie[];
  className?: string;
}

export const NewReleasesRow = ({ title = "Just Added", movies, className }: NewReleasesRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        el.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [movies]);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  if (!movies.length) return null;

  return (
    <section className={cn("relative group/new", className)}>
      <motion.div 
        className="flex items-center gap-3 mb-4 px-4 md:px-8 lg:px-12"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <div className="p-2 rounded-lg bg-primary/15 border border-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h2 className="font-display text-xl md:text-2xl font-bold">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
      </motion.div>

      <div className="relative">
        {/* Edge Fades */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )} />
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity",
          canScrollRight ? "opacity-100" : "opacity-0"
        )} />

        {/* Navigation - circular floating buttons */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/60 backdrop-blur-md border border-border/30",
            "opacity-0 group-hover/new:opacity-100 transition-all hover:bg-background/80",
            !canScrollLeft && "pointer-events-none !opacity-0"
          )}
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/60 backdrop-blur-md border border-border/30",
            "opacity-0 group-hover/new:opacity-100 transition-all hover:bg-background/80",
            !canScrollRight && "pointer-events-none !opacity-0"
          )}
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar scroll-smooth px-4 md:px-8 lg:px-12 py-2"
        >
          {movies.map((movie, index) => {
            const isTV = movie.media_type === "tv";
            const detailPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
            const movieTitle = movie.title || movie.name;

            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 24 }}
              >
                <Link
                  to={detailPath}
                  className="group/card relative flex-shrink-0 w-[140px] md:w-[160px] lg:w-[180px] block"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden transition-all duration-500 group-hover/card:scale-105 group-hover/card:shadow-hover">
                    <img
                      src={getImageUrl(movie.poster_path, "w500")}
                      alt={movieTitle}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      loading="lazy"
                    />
                    
                    {/* NEW Badge */}
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-primary/50">
                      NEW
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="mt-2">
                    <h3 className="font-medium text-sm line-clamp-1">{movieTitle}</h3>
                    <p className="text-xs text-muted-foreground">
                      {(movie.release_date || movie.first_air_date)?.split("-")[0]}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
