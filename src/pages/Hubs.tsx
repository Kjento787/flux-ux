import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import {
  Swords, Laugh, Ghost, Rocket, Heart, Sparkles, Drama,
  Mountain, Music, Baby, Clapperboard, Scroll, Skull, Compass,
} from "lucide-react";
import { discoverMovies, discoverTV, getImageUrl } from "@/lib/tmdb";
import { LucideIcon } from "lucide-react";

interface HubData {
  id: number;
  name: string;
  description: string;
  icon: LucideIcon;
  genreId: number;
  isTV?: boolean;
}

const hubs: HubData[] = [
  { id: 1, name: "Action", description: "High-octane thrills", icon: Swords, genreId: 28 },
  { id: 2, name: "Comedy", description: "Laughs guaranteed", icon: Laugh, genreId: 35 },
  { id: 3, name: "Horror", description: "Fear the unknown", icon: Ghost, genreId: 27 },
  { id: 4, name: "Sci-Fi", description: "Beyond imagination", icon: Rocket, genreId: 878 },
  { id: 5, name: "Romance", description: "Love stories", icon: Heart, genreId: 10749 },
  { id: 6, name: "Anime", description: "Japanese animation", icon: Sparkles, genreId: 16, isTV: true },
  { id: 7, name: "Drama", description: "Powerful narratives", icon: Drama, genreId: 18 },
  { id: 8, name: "Adventure", description: "Epic journeys", icon: Compass, genreId: 12 },
  { id: 9, name: "Thriller", description: "Edge of your seat", icon: Skull, genreId: 53 },
  { id: 10, name: "Documentary", description: "Real stories", icon: Clapperboard, genreId: 99 },
  { id: 11, name: "Music", description: "Feel the rhythm", icon: Music, genreId: 10402 },
  { id: 12, name: "Family", description: "For everyone", icon: Baby, genreId: 10751 },
  { id: 13, name: "Fantasy", description: "Magical worlds", icon: Mountain, genreId: 14 },
  { id: 14, name: "History", description: "Stories of the past", icon: Scroll, genreId: 36 },
];

const HubCard = ({ hub }: { hub: HubData }) => {
  const { data } = useQuery({
    queryKey: ["hub-preview", hub.genreId, hub.isTV],
    queryFn: () => hub.isTV
      ? discoverTV({ withGenres: String(hub.genreId), sortBy: "popularity.desc" })
      : discoverMovies({ withGenres: String(hub.genreId), sortBy: "popularity.desc" }),
  });

  const Icon = hub.icon;
  const previewMovies = data?.results?.slice(0, 4) || [];

  return (
    <Link
      to={`/genre/${hub.genreId}`}
      className="group relative rounded-lg overflow-hidden aspect-[4/3] block border border-border/30 hover:border-primary/30 transition-all"
    >
      {/* Background Images */}
      <div className="absolute inset-0 grid grid-cols-2 gap-px opacity-40 group-hover:opacity-60 transition-opacity">
        {previewMovies.map((movie) => (
          <div key={movie.id} className="relative overflow-hidden">
            <img
              src={getImageUrl(movie.poster_path, "w300")}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        <div className="p-3 rounded-lg bg-primary/10 mb-3">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
          {hub.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{hub.description}</p>
      </div>
    </Link>
  );
};

const Hubs = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Browse by Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Handpicked genre collections for every mood
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {hubs.map((hub) => (
              <HubCard key={hub.id} hub={hub} />
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Hubs;
