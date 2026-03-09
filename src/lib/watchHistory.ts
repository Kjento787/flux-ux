export interface WatchProgress {
  movieId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  progress: number; // 0-100 percentage
  currentTime: number; // in seconds
  duration: number; // in seconds
  lastWatched: string; // ISO date string
}

export interface WatchList {
  movieId: number;
  title: string;
  posterPath: string | null;
  addedAt: string;
}

const WATCH_PROGRESS_KEY = "fluxux_watch_progress";
const WATCH_LIST_KEY = "fluxux_watch_list";

export const getWatchProgress = (): WatchProgress[] => {
  try {
    const data = localStorage.getItem(WATCH_PROGRESS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveWatchProgress = (progress: WatchProgress): void => {
  const allProgress = getWatchProgress();
  const existingIndex = allProgress.findIndex((p) => p.movieId === progress.movieId);
  
  if (existingIndex >= 0) {
    allProgress[existingIndex] = progress;
  } else {
    allProgress.unshift(progress);
  }
  
  // Keep only last 50 items
  const trimmed = allProgress.slice(0, 50);
  localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(trimmed));
};

export const getMovieProgress = (movieId: number): WatchProgress | null => {
  const allProgress = getWatchProgress();
  return allProgress.find((p) => p.movieId === movieId) || null;
};

export const removeWatchProgress = (movieId: number): void => {
  const allProgress = getWatchProgress().filter((p) => p.movieId !== movieId);
  localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(allProgress));
};

export const getContinueWatching = (): WatchProgress[] => {
  return getWatchProgress()
    .filter((p) => p.progress > 0 && p.progress < 95)
    .sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime())
    .slice(0, 10);
};

export const getWatchList = (): WatchList[] => {
  try {
    const data = localStorage.getItem(WATCH_LIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addToWatchList = (movie: Omit<WatchList, "addedAt">): void => {
  const list = getWatchList();
  if (!list.find((m) => m.movieId === movie.movieId)) {
    list.unshift({ ...movie, addedAt: new Date().toISOString() });
    localStorage.setItem(WATCH_LIST_KEY, JSON.stringify(list));
  }
};

export const removeFromWatchList = (movieId: number): void => {
  const list = getWatchList().filter((m) => m.movieId !== movieId);
  localStorage.setItem(WATCH_LIST_KEY, JSON.stringify(list));
};

export const isInWatchList = (movieId: number): boolean => {
  return getWatchList().some((m) => m.movieId === movieId);
};
