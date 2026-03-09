import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ className, size = "md", fullScreen }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const dotSize = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  const spinner = (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className={cn("rounded-full border-2 border-primary/20", sizeClasses[size])}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{ borderTopColor: "hsl(var(--primary))" }}
        />
        {/* Inner glow */}
        <div
          className="absolute inset-0 rounded-full blur-md"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)" }}
        />
      </div>
      {/* Animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("rounded-full bg-primary/60", dotSize[size])}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const MovieCardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-xl overflow-hidden bg-card/60 border border-border/10", className)}>
    <div className="aspect-[2/3] bg-secondary/50 relative overflow-hidden rounded-xl">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
    <div className="p-2.5 space-y-2">
      <div className="h-4 bg-secondary/40 rounded-lg relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
      </div>
      <div className="h-3 w-1/2 bg-secondary/30 rounded-lg relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
      </div>
    </div>
  </div>
);

export const HeroBannerSkeleton = () => (
  <div className="h-[85vh] md:h-screen relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-secondary/30 via-muted/20 to-secondary/30">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
    <div className="absolute bottom-1/3 left-4 md:left-8 lg:left-12 space-y-4">
      <div className="h-12 md:h-16 w-64 md:w-96 bg-secondary/30 rounded-xl relative overflow-hidden">
        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
      </div>
      <div className="h-4 w-32 bg-secondary/20 rounded-lg relative overflow-hidden">
        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} />
      </div>
      <div className="h-16 w-80 md:w-[500px] max-w-full bg-secondary/15 rounded-xl relative overflow-hidden">
        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
      </div>
      <div className="flex gap-3">
        <div className="h-12 w-32 bg-primary/10 rounded-xl relative overflow-hidden">
          <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
        </div>
        <div className="h-12 w-36 bg-secondary/20 rounded-xl relative overflow-hidden">
          <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} />
        </div>
      </div>
    </div>
  </div>
);

export const CarouselSkeleton = ({ title }: { title?: string }) => (
  <div className="space-y-4 px-4 md:px-8 lg:px-12">
    {title && <div className="h-6 w-40 bg-secondary/30 rounded-lg relative overflow-hidden">
      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
        animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
    </div>}
    <div className="flex gap-2 md:gap-3 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <MovieCardSkeleton key={i} className="flex-shrink-0 w-32 sm:w-36 md:w-40 lg:w-44" />
      ))}
    </div>
  </div>
);
