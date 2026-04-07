import { useQuery } from "@tanstack/react-query";
import { fetchTrendingAll, fetchTrendingMovies, fetchTrendingTV, Movie } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { PageTransition } from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
        <div key={item.id} className="relative">
          {i < 10 && (
            <div className="absolute -top-1.5 -left-1.5 z-10">
              <Badge className="text-[10px] font-bold px-1.5 py-0.5 bg-primary text-primary-foreground">
                #{i + 1}
              </Badge>
            </div>
          )}
          <MovieCard movie={item} />
        </div>
      ))}
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Trending Now</h1>
            <p className="text-sm text-muted-foreground mt-1">What everyone is watching today</p>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-card/80 border border-border/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="movies">Movies</TabsTrigger>
              <TabsTrigger value="tv">TV Shows</TabsTrigger>
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
