import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, AlertTriangle } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LeavingSoonRowProps {
  title?: string;
  movies: Movie[];
  className?: string;
}

const getExpirationTime = (index: number): Date => {
  const now = new Date();
  const hoursOptions = [6, 12, 24, 48, 72, 120, 168, 240, 336];
  const hoursLeft = hoursOptions[index % hoursOptions.length];
  return new Date(now.getTime() + hoursLeft * 60 * 60 * 1000);
};

interface CountdownProps {
  targetDate: Date;
}

const LiveCountdown = ({ targetDate }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    const difference = targetDate.getTime() - Date.now();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  }, [targetDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      const t = calculateTimeLeft();
      setTimeLeft(t);
      setIsUrgent(t.days === 0 && t.hours < 24);
    }, 1000);
    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    setIsUrgent(initial.days === 0 && initial.hours < 24);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const fmt = (n: number) => String(n).padStart(2, '0');

  if (timeLeft.days > 0) {
    return (
      <div className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border",
        timeLeft.days <= 3 
          ? "bg-destructive/80 text-destructive-foreground border-destructive/50" 
          : "bg-background/60 text-foreground border-border/50"
      )}>
        <Clock className="h-3 w-3" />
        <span>{timeLeft.days}d {timeLeft.hours}h</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold backdrop-blur-md border",
      isUrgent 
        ? "bg-destructive/80 text-destructive-foreground border-destructive/50 animate-pulse" 
        : "bg-background/60 text-foreground border-border/50"
    )}>
      {isUrgent && <AlertTriangle className="h-3 w-3" />}
      <span>{fmt(timeLeft.hours)}:{fmt(timeLeft.minutes)}:{fmt(timeLeft.seconds)}</span>
    </div>
  );
};

export const LeavingSoonRow = ({ title = "Leaving Soon", movies, className }: LeavingSoonRowProps) => {
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
    <section className={cn("relative group/leaving", className)}>
      <motion.div 
        className="flex items-center gap-3 mb-4 px-4 md:px-8 lg:px-12"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <div className="p-2 rounded-lg bg-destructive/15 border border-destructive/20">
          <Clock className="h-5 w-5 text-destructive" />
        </div>
        <h2 className="font-display text-xl md:text-2xl font-bold">{title}</h2>
        <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Live</span>
        <div className="h-px flex-1 bg-gradient-to-r from-destructive/20 to-transparent" />
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

        {/* Navigation */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/60 backdrop-blur-md border border-border/30",
            "opacity-0 group-hover/leaving:opacity-100 transition-all hover:bg-background/80",
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
            "opacity-0 group-hover/leaving:opacity-100 transition-all hover:bg-background/80",
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
          {movies.slice(0, 10).map((movie, index) => {
            const isTV = movie.media_type === "tv";
            const detailPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
            const movieTitle = movie.title || movie.name;
            const expirationDate = getExpirationTime(index);
            const daysLeft = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 24 }}
              >
                <Link
                  to={detailPath}
                  className="group/card relative flex-shrink-0 w-[140px] md:w-[160px] lg:w-[180px] block"
                >
                  <div className={cn(
                    "relative aspect-[2/3] rounded-lg overflow-hidden transition-all duration-500",
                    "group-hover/card:scale-105",
                    daysLeft <= 1 && "ring-2 ring-destructive/60"
                  )}
                  style={{
                    boxShadow: daysLeft <= 3 ? '0 4px 20px -4px hsl(var(--destructive) / 0.3)' : undefined
                  }}
                  >
                    <img
                      src={getImageUrl(movie.poster_path, "w500")}
                      alt={movieTitle}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Live Countdown Badge */}
                    <div className="absolute top-2 left-2">
                      <LiveCountdown targetDate={expirationDate} />
                    </div>

                    {/* Urgent pulse ring */}
                    {daysLeft <= 1 && (
                      <div className="absolute inset-0 rounded-lg border-2 border-destructive pointer-events-none animate-pulse" />
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="mt-2">
                    <h3 className="font-medium text-sm line-clamp-1">{movieTitle}</h3>
                    <p className={cn(
                      "text-xs font-medium",
                      daysLeft <= 1 ? "text-destructive" : daysLeft <= 3 ? "text-destructive/80" : "text-muted-foreground"
                    )}>
                      {daysLeft <= 0 ? "Leaving today!" : daysLeft === 1 ? "Last day!" : `${daysLeft} days left`}
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
