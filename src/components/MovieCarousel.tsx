import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Movie } from "@/lib/tmdb";
import { MovieCard } from "./MovieCard";
import { cn } from "@/lib/utils";

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  className?: string;
  showProgress?: boolean;
  progressData?: Record<number, number>;
  icon?: React.ReactNode;
  variant?: "default" | "large";
  onRemove?: (movieId: number) => void;
  linkTo?: string;
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
  linkTo,
}: MovieCarouselProps) => {
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
      el.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);
      return () => {
        el.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [movies]);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: dir === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  if (!movies.length) return null;

  return (
    <section className={cn("relative group/carousel", className)}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3 px-4 md:px-8 lg:px-12">
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          {title}
        </h2>
        {linkTo && (
          <Link to={linkTo} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-5 w-5" />
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Nav arrows */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/80 hover:bg-card flex items-center justify-center border border-border/50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/80 hover:bg-card flex items-center justify-center border border-border/50 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar scroll-smooth px-4 md:px-8 lg:px-12 pb-2"
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              variant={variant === "large" ? "large" : "default"}
              showProgress={showProgress}
              progress={progressData?.[movie.id]}
              index={index}
              onRemove={onRemove ? () => onRemove(movie.id) : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
