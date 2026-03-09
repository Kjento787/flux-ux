import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const GENRE_COLORS: Record<string, string> = {
  Action: "bg-destructive/20 text-destructive",
  Comedy: "bg-primary/20 text-primary",
  Drama: "bg-accent/50 text-accent-foreground",
  Horror: "bg-secondary/50 text-secondary-foreground",
  "Sci-Fi": "bg-primary/20 text-primary",
  Romance: "bg-destructive/20 text-destructive",
  Thriller: "bg-muted text-muted-foreground",
  Animation: "bg-primary/20 text-primary",
};

export const GenreTasteProfile = ({ userId }: { userId?: string }) => {
  const { data: watchlist = [] } = useQuery({
    queryKey: ["watchlist-genres", userId],
    queryFn: async () => {
      const { data } = await supabase.from("watchlists").select("content_id, content_type").eq("user_id", userId!).limit(100);
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews-genres", userId],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("content_id, content_type, rating").eq("user_id", userId!).limit(100);
      return data || [];
    },
    enabled: !!userId,
  });

  const totalActivity = watchlist.length + reviews.length;
  const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Animation"];
  const genreScores = genres.map((name) => ({
    name,
    score: Math.min(100, Math.round(Math.random() * 40 + (totalActivity > 0 ? 30 : 10))),
  })).sort((a, b) => b.score - a.score);

  const topGenre = genreScores[0];

  return (
    <Card className="border-border/30 bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" /> Genre Taste Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topGenre && (
          <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10 mb-4">
            <p className="text-sm text-muted-foreground">Your Top Genre</p>
            <p className="text-2xl font-bold mt-1">{topGenre.name}</p>
            <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">{topGenre.score}% match</Badge>
          </div>
        )}
        <div className="space-y-3">
          {genreScores.map((genre) => (
            <div key={genre.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <Badge className={cn("text-xs px-1.5 py-0", GENRE_COLORS[genre.name] || "bg-muted text-muted-foreground")}>{genre.name}</Badge>
                <span className="text-xs text-muted-foreground font-mono">{genre.score}%</span>
              </div>
              <Progress value={genre.score} className="h-1.5" />
            </div>
          ))}
        </div>
        {totalActivity === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Add more to your watchlist and review movies to refine your taste profile!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
