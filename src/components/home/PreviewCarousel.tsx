import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/lib/tmdb";
import { QuickPreviewCard } from "./QuickPreviewCard";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PreviewCarouselProps {
  title: string;
  movies: Movie[];
  icon?: React.ReactNode;
  className?: string;
}

export const PreviewCarousel = ({ title, movies, icon, className }: PreviewCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isInView, setIsInView] = useState(false);

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
      const amount = scrollRef.current.clientWidth * 0.7;
      scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  if (!movies.length) return null;

  return (
    <section ref={sectionRef} className={cn("relative group/preview", className)}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2.5 mb-3 md:mb-4 px-4 md:px-8 lg:px-12"
      >
        {icon}
        <h2 className="text-xl md:text-2xl font-bold group-hover/preview:text-primary transition-colors duration-300 font-display">
          {title}
        </h2>
        <ChevronRight className="h-5 w-5 opacity-0 -translate-x-2 group-hover/preview:opacity-70 group-hover/preview:translate-x-0 transition-all text-primary" />
      </motion.div>

      <div className="relative">
        {/* Edge Fades */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-500",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )} />
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-500",
          canScrollRight ? "opacity-100" : "opacity-0"
        )} />

        {/* Navigation */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-1 top-1/3 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full",
            "bg-background/60 hover:bg-background/80 backdrop-blur-md border border-foreground/10 shadow-lg",
            "opacity-0 group-hover/preview:opacity-100 transition-all duration-300",
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
            "absolute right-1 top-1/3 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full",
            "bg-background/60 hover:bg-background/80 backdrop-blur-md border border-foreground/10 shadow-lg",
            "opacity-0 group-hover/preview:opacity-100 transition-all duration-300",
            !canScrollRight && "pointer-events-none !opacity-0"
          )}
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </Button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar scroll-smooth px-4 md:px-8 lg:px-12 py-2 pb-32"
        >
          {movies.map((movie, index) => (
            <QuickPreviewCard
              key={movie.id}
              movie={movie}
              index={isInView ? index : 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
