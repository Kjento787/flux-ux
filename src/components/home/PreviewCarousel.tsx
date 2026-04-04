import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/lib/tmdb";
import { QuickPreviewCard } from "./QuickPreviewCard";
import { cn } from "@/lib/utils";

interface PreviewCarouselProps {
  title: string;
  movies: Movie[];
  icon?: React.ReactNode;
  className?: string;
}

export const PreviewCarousel = ({ title, movies, icon, className }: PreviewCarouselProps) => {
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
      return () => el.removeEventListener('scroll', checkScrollability);
    }
  }, [movies]);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.7;
      scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  if (!movies.length) return null;

  return (
    <section className={cn("relative group/preview", className)}>
      <div className="flex items-center gap-2 mb-3 px-4 md:px-8 lg:px-12">
        <h2 className="text-lg md:text-xl font-bold text-foreground">{title}</h2>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 top-1/3 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/80 hover:bg-card flex items-center justify-center border border-border/50 opacity-0 group-hover/preview:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 top-1/3 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/80 hover:bg-card flex items-center justify-center border border-border/50 opacity-0 group-hover/preview:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar scroll-smooth px-4 md:px-8 lg:px-12 pb-2"
        >
          {movies.map((movie) => (
            <QuickPreviewCard key={movie.id} movie={movie} index={0} />
          ))}
        </div>
      </div>
    </section>
  );
};
