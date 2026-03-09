import { useCallback } from "react";

const WATCH_HISTORY_KEY = "bloxwave_watch_history_v2";

export interface WatchHistoryEntry {
  contentId: number;
  contentType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  season?: number;
  episode?: number;
  lastWatched: string;
  server: string;
}

export const useWatchHistory = () => {
  const getHistory = useCallback((): WatchHistoryEntry[] => {
    try {
      const data = localStorage.getItem(WATCH_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }, []);

  const addToHistory = useCallback((entry: Omit<WatchHistoryEntry, "lastWatched">) => {
    const history = (() => {
      try {
        const data = localStorage.getItem(WATCH_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    })();

    const filtered = history.filter(
      (h: WatchHistoryEntry) =>
        !(h.contentId === entry.contentId && h.contentType === entry.contentType)
    );

    filtered.unshift({ ...entry, lastWatched: new Date().toISOString() });
    const trimmed = filtered.slice(0, 100);
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(trimmed));
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(WATCH_HISTORY_KEY);
  }, []);

  return { getHistory, addToHistory, clearHistory };
};
