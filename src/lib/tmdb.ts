import { supabase } from "@/integrations/supabase/client";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export interface Movie {
  id: number;
  title: string;
  name?: string; // For TV shows
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  first_air_date?: string; // For TV shows
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  media_type?: "movie" | "tv" | "person";
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  media_type: "tv";
}

export interface ReleaseDateResult {
  iso_3166_1: string;
  release_dates: {
    certification: string;
    type: number;
  }[];
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: Genre[];
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  videos?: { results: Video[] };
  credits?: { cast: Cast[]; crew: Crew[] };
  release_dates?: { results: ReleaseDateResult[] };
}

export interface ContentRating {
  iso_3166_1: string;
  rating: string;
}

export interface TVDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  tagline: string;
  status: string;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  videos?: { results: Video[] };
  credits?: { cast: Cast[]; crew: Crew[] };
  seasons: TVSeason[];
  content_ratings?: { results: ContentRating[] };
}

export interface TVSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

export interface MoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke('tmdb-proxy', {
    body: { endpoint, params },
  });

  if (error) {
    console.error('TMDB proxy error:', error);
    throw new Error('Failed to fetch from TMDB');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as T;
}

export const getImageUrl = (path: string | null, size: "w200" | "w300" | "w500" | "w780" | "original" = "w500"): string => {
  if (!path) return "";
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export interface EmbedServer {
  id: string;
  name: string;
  hasSubtitles: boolean;
}

export const EMBED_SERVERS: EmbedServer[] = [
  { id: "vidsrcxyz", name: "Server 1 (VidSrc.xyz)", hasSubtitles: true },
  { id: "2embed", name: "Server 2 (2Embed)", hasSubtitles: true },
  { id: "vidsrc", name: "Server 3 (VidSrc)", hasSubtitles: true },
  { id: "vidsrcpro", name: "Server 4 (VidSrc Pro)", hasSubtitles: true },
  { id: "embedsu", name: "Server 5 (Embed.su)", hasSubtitles: false },
  { id: "autoembed", name: "Server 6 (AutoEmbed)", hasSubtitles: true },
  { id: "multiembed", name: "Server 7 (MultiEmbed)", hasSubtitles: true },
];

export const getEmbedUrl = (
  id: number, 
  type: "movie" | "tv" = "movie", 
  season?: number, 
  episode?: number,
  serverId: string = "vidsrcxyz"
): string => {
  const s = season ?? 1;
  const e = episode ?? 1;
  
  switch (serverId) {
    case "vidsrcxyz":
      return type === "tv" 
        ? `https://vidsrc.xyz/embed/tv/${id}/${s}-${e}`
        : `https://vidsrc.xyz/embed/movie/${id}`;
    
    case "vidsrc":
      return type === "tv" 
        ? `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
        : `https://vidsrc.cc/v2/embed/movie/${id}`;
    
    case "vidsrcpro":
      return type === "tv"
        ? `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`
        : `https://vidsrc.pro/embed/movie/${id}`;
    
    case "embedsu":
      return type === "tv"
        ? `https://embed.su/embed/tv/${id}/${s}/${e}`
        : `https://embed.su/embed/movie/${id}`;
    
    case "autoembed":
      return type === "tv"
        ? `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`
        : `https://player.autoembed.cc/embed/movie/${id}`;
    
    case "multiembed":
      return type === "tv"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`;
    
    case "2embed":
    default:
      return type === "tv"
        ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
        : `https://www.2embed.cc/embed/${id}`;
  }
};

export const fetchPopularMovies = async (page = 1): Promise<MoviesResponse> => {
  return tmdbFetch<MoviesResponse>('/movie/popular', { language: 'en-US', page: String(page) });
};

export const fetchTrendingMovies = async (timeWindow: "day" | "week" = "week"): Promise<MoviesResponse> => {
  return tmdbFetch<MoviesResponse>(`/trending/movie/${timeWindow}`);
};

export const fetchTopRatedMovies = async (page = 1): Promise<MoviesResponse> => {
  return tmdbFetch<MoviesResponse>('/movie/top_rated', { language: 'en-US', page: String(page) });
};

export const fetchUpcomingMovies = async (page = 1): Promise<MoviesResponse> => {
  return tmdbFetch<MoviesResponse>('/movie/upcoming', { language: 'en-US', page: String(page) });
};

export const fetchNowPlayingMovies = async (page = 1): Promise<MoviesResponse> => {
  return tmdbFetch<MoviesResponse>('/movie/now_playing', { language: 'en-US', page: String(page) });
};

export const fetchMoviesByGenre = async (genreId: number, page = 1): Promise<MoviesResponse> => {
  return tmdbFetch<MoviesResponse>('/discover/movie', {
    language: 'en-US',
    with_genres: String(genreId),
    page: String(page),
    sort_by: 'popularity.desc'
  });
};

export const fetchGenres = async (): Promise<{ genres: Genre[] }> => {
  return tmdbFetch<{ genres: Genre[] }>('/genre/movie/list', { language: 'en-US' });
};

export const fetchMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  return tmdbFetch<MovieDetails>(`/movie/${movieId}`, { 
    language: 'en-US',
    append_to_response: 'videos,credits,release_dates'
  });
};

// Check if movie has 18+ certification (R, NC-17, X, 18, etc.)
export const isAdultRated = (movie: MovieDetails): boolean => {
  // If explicitly marked as adult, return true
  if (movie.adult) return true;
  
  // Check release_dates for certifications
  if (!movie.release_dates?.results) return false;
  
  // Adult certifications by country
  const adultCertifications: Record<string, string[]> = {
    US: ['R', 'NC-17', 'X', 'NR'], // NR often means unrated adult content
    GB: ['18', 'R18'],
    DE: ['18', 'FSK 18'],
    FR: ['18', '-18'],
    AU: ['R18+', 'X18+'],
    BR: ['18'],
    CA: ['R', '18A', '18+'],
    IN: ['A'],
    IT: ['VM18'],
    JP: ['R18+'],
    KR: ['18'],
    MX: ['D'],
    NL: ['18'],
    ES: ['18'],
  };
  
  // Check US first, then other countries
  const priorityCountries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR'];
  
  for (const country of priorityCountries) {
    const countryResult = movie.release_dates.results.find(r => r.iso_3166_1 === country);
    if (countryResult) {
      const certs = adultCertifications[country] || [];
      const hasCert = countryResult.release_dates.some(rd => 
        certs.includes(rd.certification)
      );
      if (hasCert) return true;
    }
  }
  
  // Also check any other country for adult certification
  for (const result of movie.release_dates.results) {
    const certs = adultCertifications[result.iso_3166_1] || [];
    if (result.release_dates.some(rd => certs.includes(rd.certification))) {
      return true;
    }
  }
  
  return false;
};

export const searchMovies = async (query: string, page = 1): Promise<MoviesResponse> => {
  return tmdbFetch<MoviesResponse>('/search/movie', {
    language: 'en-US',
    query: encodeURIComponent(query),
    page: String(page)
  });
};

export const searchMulti = async (query: string, page = 1): Promise<MoviesResponse> => {
  const data = await tmdbFetch<MoviesResponse>('/search/multi', {
    language: 'en-US',
    query: encodeURIComponent(query),
    page: String(page)
  });
  
  // Filter out person results and normalize TV shows to look like movies
  const filteredResults = data.results
    .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
    .map((item: any) => ({
      ...item,
      title: item.title || item.name,
      release_date: item.release_date || item.first_air_date,
    }));
  
  return {
    ...data,
    results: filteredResults,
  };
};

export const fetchTVDetails = async (tvId: number): Promise<TVDetails> => {
  return tmdbFetch<TVDetails>(`/tv/${tvId}`, { 
    language: 'en-US',
    append_to_response: 'videos,credits,content_ratings'
  });
};

// Check if TV show has 18+ content rating
export const isTVAdultRated = (tvShow: TVDetails): boolean => {
  if (!tvShow.content_ratings?.results) return false;
  
  // Adult TV ratings by country
  const adultTVRatings: Record<string, string[]> = {
    US: ['TV-MA'],
    GB: ['18', 'R18'],
    DE: ['18', '16'],
    FR: ['18', '-18'],
    AU: ['MA15+', 'R18+', 'X18+'],
    BR: ['18'],
    CA: ['18+', 'A'],
    ES: ['18'],
    IT: ['VM18'],
    JP: ['R18+'],
    KR: ['18'],
    NL: ['18'],
  };
  
  // Check US first, then other countries
  const priorityCountries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR'];
  
  for (const country of priorityCountries) {
    const countryRating = tvShow.content_ratings.results.find(r => r.iso_3166_1 === country);
    if (countryRating) {
      const ratings = adultTVRatings[country] || [];
      if (ratings.includes(countryRating.rating)) {
        return true;
      }
    }
  }
  
  // Also check any other country
  for (const result of tvShow.content_ratings.results) {
    const ratings = adultTVRatings[result.iso_3166_1] || [];
    if (ratings.includes(result.rating)) {
      return true;
    }
  }
  
  return false;
};

export const fetchSimilarTV = async (tvId: number): Promise<MoviesResponse> => {
  const data = await tmdbFetch<any>(`/tv/${tvId}/similar`, { language: 'en-US' });
  return {
    ...data,
    results: data.results.map((item: any) => ({
      ...item,
      title: item.name,
      release_date: item.first_air_date,
      media_type: 'tv',
    })),
  };
};

export const fetchSimilarMovies = async (movieId: number): Promise<MoviesResponse> => {
  return tmdbFetch<MoviesResponse>(`/movie/${movieId}/similar`, { language: 'en-US' });
};

export const discoverMovies = async (params: {
  page?: number;
  sortBy?: string;
  year?: number;
  voteAverageGte?: number;
  withGenres?: string;
  withKeywords?: string;
}): Promise<MoviesResponse> => {
  const queryParams: Record<string, string> = {
    language: 'en-US',
    page: String(params.page || 1),
    sort_by: params.sortBy || 'popularity.desc',
  };

  if (params.year) queryParams.year = String(params.year);
  if (params.voteAverageGte) queryParams['vote_average.gte'] = String(params.voteAverageGte);
  if (params.withGenres) queryParams.with_genres = params.withGenres;
  if (params.withKeywords) queryParams.with_keywords = params.withKeywords;

  return tmdbFetch<MoviesResponse>('/discover/movie', queryParams);
};

// Fetch trending TV shows
export const fetchTrendingTV = async (timeWindow: "day" | "week" = "week"): Promise<MoviesResponse> => {
  const data = await tmdbFetch<any>(`/trending/tv/${timeWindow}`);
  return {
    ...data,
    results: data.results.map((item: any) => ({
      ...item,
      title: item.name,
      release_date: item.first_air_date,
      media_type: 'tv' as const,
    })),
  };
};

// Fetch trending all (movies + TV)
export const fetchTrendingAll = async (timeWindow: "day" | "week" = "week"): Promise<MoviesResponse> => {
  const data = await tmdbFetch<any>(`/trending/all/${timeWindow}`);
  return {
    ...data,
    results: data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => ({
        ...item,
        title: item.title || item.name,
        release_date: item.release_date || item.first_air_date,
      })),
  };
};

// Discover TV shows
export const discoverTV = async (params: {
  page?: number;
  sortBy?: string;
  withGenres?: string;
  withKeywords?: string;
}): Promise<MoviesResponse> => {
  const queryParams: Record<string, string> = {
    language: 'en-US',
    page: String(params.page || 1),
    sort_by: params.sortBy || 'popularity.desc',
  };

  if (params.withGenres) queryParams.with_genres = params.withGenres;
  if (params.withKeywords) queryParams.with_keywords = params.withKeywords;

  const data = await tmdbFetch<any>('/discover/tv', queryParams);
  return {
    ...data,
    results: data.results.map((item: any) => ({
      ...item,
      title: item.name,
      release_date: item.first_air_date,
      media_type: 'tv' as const,
    })),
  };
};

// TV Genres
export const fetchTVGenres = async (): Promise<{ genres: Genre[] }> => {
  return tmdbFetch<{ genres: Genre[] }>('/genre/tv/list', { language: 'en-US' });
};

// Fetch movie videos for previews
export const fetchMovieVideos = async (movieId: number): Promise<{ results: Video[] }> => {
  return tmdbFetch<{ results: Video[] }>(`/movie/${movieId}/videos`, { language: 'en-US' });
};

// Fetch TV videos for previews
export const fetchTVVideos = async (tvId: number): Promise<{ results: Video[] }> => {
  return tmdbFetch<{ results: Video[] }>(`/tv/${tvId}/videos`, { language: 'en-US' });
};
