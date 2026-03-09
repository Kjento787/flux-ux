import { Link } from "react-router-dom";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

interface Top10RowProps {
  title: string;
  movies: Movie[];
  className?: string;
}

export const Top10Row = ({ title, movies, className }: Top10RowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const top10 = movies.slice(0, 10);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.6;
      scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  if (!top10.length) return null;

  return (
    <section ref={sectionRef} className={cn("relative group/top10", className)}>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-xl md:text-2xl lg:text-3xl font-bold mb-5 px-4 md:px-8 lg:px-12 flex items-center gap-3"
      >
        <span className="text-gradient font-black font-display text-2xl md:text-3xl lg:text-4xl">TOP 10</span>
        <span className="font-display">{title}</span>
      </motion.h2>

      <div className="relative">
        {/* Edge Fades */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-500",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )} />
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-500",
          canScrollRight ? "opacity-100" : "opacity-0"
        )} />

        {/* Navigation */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full",
            "bg-background/60 hover:bg-background/80 backdrop-blur-md border border-foreground/10 shadow-lg",
            "opacity-0 group-hover/top10:opacity-100 transition-all duration-300",
            !canScrollLeft && "pointer-events-none !opacity-0"
          )}
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full",
            "bg-background/60 hover:bg-background/80 backdrop-blur-md border border-foreground/10 shadow-lg",
            "opacity-0 group-hover/top10:opacity-100 transition-all duration-300",
            !canScrollRight && "pointer-events-none !opacity-0"
          )}
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth px-4 md:px-8 lg:px-12 py-4"
        >
          {top10.map((movie, index) => {
            const isTV = movie.media_type === "tv";
            const detailPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
            
            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={detailPath}
                  className="group/item relative flex-shrink-0 flex items-end"
                >
                  {/* Large Number — 3D perspective */}
                  <span 
                    className="absolute -left-3 md:-left-5 bottom-0 text-[130px] md:text-[180px] lg:text-[220px] font-black leading-none select-none z-0 transition-all duration-500 group-hover/item:scale-110"
                    style={{
                      WebkitTextStroke: '2px hsl(var(--primary))',
                      color: 'transparent',
                      textShadow: '0 0 60px hsl(var(--primary) / 0.2), 0 0 120px hsl(var(--primary) / 0.1)',
                      filter: 'drop-shadow(0 4px 8px hsl(var(--primary) / 0.15))',
                    }}
                  >
                    {index + 1}
                  </span>
                  
                  {/* Poster */}
                  <div className="relative z-10 ml-10 md:ml-14 lg:ml-20 w-[110px] md:w-[140px] lg:w-[160px] aspect-[2/3] rounded-xl overflow-hidden transition-all duration-500 group-hover/item:scale-105 group-hover/item:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.3)]">
                    <img
                      src={getImageUrl(movie.poster_path, "w500")}
                      alt={movie.title || movie.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover/item:scale-110"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-500" />
                    
                    {/* Play button on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all duration-300">
                      <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center shadow-glow">
                        <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground ml-0.5" />
                      </div>
                    </div>

                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-xl ring-1 ring-primary/0 group-hover/item:ring-primary/30 transition-all duration-500 pointer-events-none" />
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
