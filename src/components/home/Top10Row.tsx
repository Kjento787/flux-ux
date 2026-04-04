import { Link } from "react-router-dom";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Top10RowProps {
  title: string;
  movies: Movie[];
  className?: string;
}

export const Top10Row = ({ title, movies, className }: Top10RowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
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
      return () => el.removeEventListener('scroll', checkScrollability);
    }
  }, [movies]);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.6;
      scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  if (!top10.length) return null;

  return (
    <section className={cn("relative group/top10", className)}>
      <div className="flex items-center gap-2 mb-3 px-4 md:px-8 lg:px-12">
        <span className="text-primary font-bold text-lg">TOP 10</span>
        <span className="text-lg font-bold">{title}</span>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/80 hover:bg-card flex items-center justify-center border border-border/50 opacity-0 group-hover/top10:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/80 hover:bg-card flex items-center justify-center border border-border/50 opacity-0 group-hover/top10:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth px-4 md:px-8 lg:px-12 pb-2"
        >
          {top10.map((movie, index) => {
            const isTV = movie.media_type === "tv";
            const detailPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;

            return (
              <Link
                key={movie.id}
                to={detailPath}
                className="flex-shrink-0 flex items-end group/item"
              >
                <span
                  className="text-[80px] md:text-[100px] font-black leading-none select-none text-transparent mr-[-12px] z-0"
                  style={{ WebkitTextStroke: '2px hsl(var(--primary))' }}
                >
                  {index + 1}
                </span>
                <div className="relative z-10 w-[90px] md:w-[110px] aspect-[2/3] rounded-lg overflow-hidden group-hover/item:scale-105 transition-transform duration-200">
                  <img
                    src={getImageUrl(movie.poster_path, "w500")}
                    alt={movie.title || movie.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
