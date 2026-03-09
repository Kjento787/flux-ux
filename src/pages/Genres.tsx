import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GenreButtons } from "@/components/GenreButtons";
import { PageTransition } from "@/components/PageTransition";
import { fetchGenres } from "@/lib/tmdb";

const Genres = () => {
  const [genres, setGenres] = useState<any[]>([]);

  useEffect(() => {
    fetchGenres().then((data) => setGenres(data.genres)).catch(console.error);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <h1 className="text-3xl font-bold text-foreground mb-8">Browse by Genre</h1>
          <GenreButtons genres={genres} showAllGenres />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Genres;
