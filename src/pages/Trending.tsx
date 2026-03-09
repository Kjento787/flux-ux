import { useQuery } from "@tanstack/react-query";
import { fetchTrendingAll, fetchTrendingMovies, fetchTrendingTV, Movie, getImageUrl } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { PageTransition } from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Film, Tv, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Trending = () => {
  const { data: allData } = useQuery({
    queryKey: ["trending-all-page"], queryFn: () => fetchTrendingAll("day"),
  });
  const { data: movieData } = useQuery({
    queryKey: ["trending-movies-page"], queryFn: () => fetchTrendingMovies("day"),
  });
  const { data: tvData } = useQuery({
    queryKey: ["trending-tv-page"], queryFn: () => fetchTrendingTV("day"),
  });

  const renderGrid = (items: Movie[] | undefined) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items?.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="relative"
        >
          <div className="absolute -top-2 -left-2 z-10">
            <Badge className={cn(
              "text-xs font-bold px-2 py-0.5",
              i < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              #{i + 1}
            </Badge>
          </div>
          <MovieCard movie={item} />
        </motion.div>
      ))}
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-primary/10">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Trending Now</h1>
              <p className="text-muted-foreground">What everyone is watching today</p>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/30">
              <TabsTrigger value="all" className="gap-1.5">
                <Flame className="h-4 w-4" /> All
              </TabsTrigger>
              <TabsTrigger value="movies" className="gap-1.5">
                <Film className="h-4 w-4" /> Movies
              </TabsTrigger>
              <TabsTrigger value="tv" className="gap-1.5">
                <Tv className="h-4 w-4" /> TV Shows
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">{renderGrid(allData?.results)}</TabsContent>
            <TabsContent value="movies">{renderGrid(movieData?.results)}</TabsContent>
            <TabsContent value="tv">{renderGrid(tvData?.results)}</TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Trending;
