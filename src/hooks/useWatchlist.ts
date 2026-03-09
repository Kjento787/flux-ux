import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WatchlistItem {
  id: string;
  content_id: number;
  content_type: "movie" | "tv";
  added_at: string;
}

export const useWatchlist = () => {
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("watchlists")
        .select("*")
        .eq("user_id", user.id)
        .order("added_at", { ascending: false });

      if (error) throw error;
      return data as WatchlistItem[];
    },
  });

  const addToWatchlist = useMutation({
    mutationFn: async ({ contentId, contentType }: { contentId: number; contentType: "movie" | "tv" }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("watchlists").insert({
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
      });

      if (error) {
        if (error.code === "23505") throw new Error("Already in watchlist");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Added to watchlist");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeFromWatchlist = useMutation({
    mutationFn: async ({ contentId, contentType }: { contentId: number; contentType: "movie" | "tv" }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("watchlists")
        .delete()
        .eq("user_id", user.id)
        .eq("content_id", contentId)
        .eq("content_type", contentType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Removed from watchlist");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isInWatchlist = (contentId: number, contentType: "movie" | "tv") => {
    return watchlist?.some(
      (item) => item.content_id === contentId && item.content_type === contentType
    );
  };

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };
};
