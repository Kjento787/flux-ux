import { useQuery } from "@tanstack/react-query";
import { Star, User, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface TMDBReview {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  url: string;
}

interface TMDBReviewsResponse {
  id: number;
  page: number;
  results: TMDBReview[];
  total_pages: number;
  total_results: number;
}

interface TMDBReviewsProps {
  contentId: number;
  contentType: "movie" | "tv";
}

const fetchTMDBReviews = async (contentId: number, contentType: "movie" | "tv"): Promise<TMDBReviewsResponse> => {
  const endpoint = contentType === "movie" ? `/movie/${contentId}/reviews` : `/tv/${contentId}/reviews`;
  const { data, error } = await supabase.functions.invoke("tmdb-proxy", {
    body: { endpoint, params: { language: "en-US", page: "1" } },
  });

  if (error) throw error;
  return data;
};

const getAvatarUrl = (avatarPath: string | null): string => {
  if (!avatarPath) return "";
  // TMDB avatar paths can be full URLs or relative paths
  if (avatarPath.startsWith("/https://") || avatarPath.startsWith("/http://")) {
    return avatarPath.slice(1);
  }
  if (avatarPath.startsWith("http")) {
    return avatarPath;
  }
  return `https://image.tmdb.org/t/p/w200${avatarPath}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const truncateContent = (content: string, maxLength: number = 500): string => {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trim() + "...";
};

export const TMDBReviews = ({ contentId, contentType }: TMDBReviewsProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tmdb-reviews", contentId, contentType],
    queryFn: () => fetchTMDBReviews(contentId, contentType),
    enabled: !!contentId,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Reviews from TMDB</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.results?.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Reviews from TMDB</h2>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No reviews available yet. Be the first to share your thoughts!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reviews from TMDB</h2>
        <Badge variant="secondary" className="gap-1">
          <Star className="h-3 w-3" />
          {data.total_results} review{data.total_results !== 1 ? "s" : ""}
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {data.results.slice(0, 5).map((review) => (
          <Card key={review.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={getAvatarUrl(review.author_details.avatar_path)} alt={review.author} />
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {review.author_details.name || review.author}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>@{review.author_details.username}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {review.author_details.rating && (
                  <Badge variant="secondary" className="gap-1 shrink-0">
                    <Star className="h-3 w-3 text-primary fill-primary" />
                    {review.author_details.rating}/10
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                {truncateContent(review.content)}
              </p>
              {review.content.length > 500 && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="px-0 mt-2 h-auto text-primary"
                  asChild
                >
                  <a href={review.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                    Read full review
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {data.total_results > 5 && (
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Showing 5 of {data.total_results} reviews
          </p>
        </div>
      )}
    </div>
  );
};
