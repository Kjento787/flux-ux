import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/lib/tmdb";
import { MovieCard } from "./MovieCard";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  className?: string;
  showProgress?: boolean;
  progressData?: Record<number, number>;
  icon?: React.ReactNode;
  variant?: "default" | "large";
  onRemove?: (movieId: number) => void;
}

export const MovieCarousel = ({
  title,
  movies,
  className,
  showProgress,
  progressData,
  icon,
  variant = "default",
  onRemove,
}: MovieCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [movies]);

  // Intersection observer for scroll-triggered reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!movies.length) return null;

  return (
    <section ref={sectionRef} className={cn("relative group/carousel", className)}>
      {/* Row Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-8 lg:px-12"
      >
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight flex items-center gap-2.5 group-hover/carousel:text-primary transition-colors duration-300">
          {icon}
          <span className="font-display">{title}</span>
          <ChevronRight className="h-5 w-5 opacity-0 -translate-x-2 group-hover/carousel:opacity-70 group-hover/carousel:translate-x-0 transition-all text-primary" />
        </h2>
      </motion.div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Edge Gradient Fades */}
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-500",
            canScrollLeft ? "opacity-100" : "opacity-0"
          )} 
        />
        <div 
          className={cn(
            "absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-500",
            canScrollRight ? "opacity-100" : "opacity-0"
          )} 
        />

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full",
            "bg-background/60 hover:bg-background/80 backdrop-blur-md border border-foreground/10",
            "opacity-0 group-hover/carousel:opacity-100 transition-all duration-300",
            "shadow-lg",
            !canScrollLeft && "pointer-events-none !opacity-0"
          )}
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full",
            "bg-background/60 hover:bg-background/80 backdrop-blur-md border border-foreground/10",
            "opacity-0 group-hover/carousel:opacity-100 transition-all duration-300",
            "shadow-lg",
            !canScrollRight && "pointer-events-none !opacity-0"
          )}
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </Button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar scroll-smooth px-4 md:px-8 lg:px-12 py-2"
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              variant={variant === "large" ? "large" : "default"}
              showProgress={showProgress}
              progress={progressData?.[movie.id]}
              index={isInView ? index : 0}
              onRemove={onRemove ? () => onRemove(movie.id) : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
