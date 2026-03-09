import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { MovieCarousel } from './MovieCarousel';
import { supabase } from '@/integrations/supabase/client';
import { getContinueWatching, getWatchList } from '@/lib/watchHistory';
import { fetchSimilarMovies, Movie } from '@/lib/tmdb';

export const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateRecommendations = async () => {
      try {
        // Get user's watch history and watchlist
        const watchHistory = getContinueWatching();
        const watchlist = getWatchList();

        // Get user's reviews from database
        const { data: { session } } = await supabase.auth.getSession();
        let reviewedContentIds: number[] = [];
        
        if (session?.user) {
          const { data: reviews } = await supabase
            .from('reviews')
            .select('content_id')
            .eq('user_id', session.user.id)
            .eq('content_type', 'movie');
          
          reviewedContentIds = reviews?.map(r => r.content_id) || [];
        }

        // Combine all content IDs the user has interacted with
        const allContentIds = [
          ...watchHistory.map(w => w.movieId),
          ...watchlist.map(w => w.movieId),
          ...reviewedContentIds,
        ];

        // Get unique IDs
        const uniqueIds = [...new Set(allContentIds)].slice(0, 5);

        if (uniqueIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch similar movies for each content
        const similarMoviesPromises = uniqueIds.map(id => fetchSimilarMovies(id));
        const similarResults = await Promise.all(similarMoviesPromises);

        // Flatten and deduplicate recommendations
        const allRecommendations = similarResults.flatMap(r => r?.results || []);
        const seenIds = new Set(uniqueIds);
        const uniqueRecommendations = allRecommendations.filter(movie => {
          if (seenIds.has(movie.id)) return false;
          seenIds.add(movie.id);
          return true;
        });

        // Sort by vote average and take top recommendations
        const sortedRecommendations = uniqueRecommendations
          .sort((a, b) => b.vote_average - a.vote_average)
          .slice(0, 20);

        setRecommendations(sortedRecommendations);
      } catch (error) {
        console.error('Error generating recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    generateRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Recommended For You</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] rounded-lg bg-muted" />
              <div className="mt-2 h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <MovieCarousel
      title="Recommended For You"
      movies={recommendations}
      icon={<Sparkles className="h-5 w-5 text-primary" />}
    />
  );
};
