import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Brain, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AIRecommendation {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  media_type: "movie" | "tv";
  reason: string;
  overview: string;
}

interface AICategory {
  label: string;
  items: AIRecommendation[];
}

export const ForYouSection = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-recommendations", userId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-recommendations", {
        body: { user_id: userId },
      });
      if (error) throw error;
      return data as { categories: AICategory[] };
    },
    enabled: !!userId,
    staleTime: 30 * 60 * 1000, // Cache for 30 min
    retry: 1,
  });

  if (!userId || (!isLoading && (!data?.categories || data.categories.length === 0))) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="px-4 md:px-8 lg:px-12 space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary animate-pulse" />
          <h2 className="text-xl font-bold font-display">AI is analyzing your taste...</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] rounded-xl bg-muted" />
              <div className="mt-2 h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {data?.categories.map((category, catIdx) => (
        <section key={catIdx} className="px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: catIdx * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-lg md:text-xl font-bold font-display">{category.label}</h3>
              <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-primary/30 text-primary ml-1">
                AI Pick
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {category.items.slice(0, 6).map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card border border-border/30 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/40 group-hover:shadow-hover">
                      {item.poster_path ? (
                        <img
                          src={getImageUrl(item.poster_path, "w300")}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-[10px] text-primary/90 line-clamp-2 font-medium">{item.reason}</p>
                      </div>
                      {item.vote_average > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-[10px] font-bold">
                          <Star className="h-2.5 w-2.5 text-primary fill-primary" />
                          {item.vote_average.toFixed(1)}
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge className={cn(
                          "text-[9px] uppercase",
                          item.media_type === "tv" ? "bg-secondary/80" : "bg-primary/80"
                        )}>
                          {item.media_type === "tv" ? "TV" : "Movie"}
                        </Badge>
                      </div>
                    </div>
                    <h4 className="mt-2 text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      ))}
    </div>
  );
};
