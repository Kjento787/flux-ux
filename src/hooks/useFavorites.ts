import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserFavorite {
  id: string;
  tmdb_id: number;
  content_type: string;
  title: string;
  release_date: string | null;
  poster_path: string | null;
  notified: boolean;
}

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["user-favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserFavorite[];
    },
    enabled: !!userId,
  });

  const addFavorite = useMutation({
    mutationFn: async (item: { tmdb_id: number; content_type: string; title: string; release_date?: string; poster_path?: string; last_known_seasons?: number }) => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase.from("user_favorites").insert({
        user_id: userId,
        tmdb_id: item.tmdb_id,
        content_type: item.content_type,
        title: item.title,
        release_date: item.release_date || null,
        poster_path: item.poster_path || null,
        last_known_seasons: item.last_known_seasons || 0,
      });
      if (error) throw error;

      // Send Discord DM notification (fire and forget)
      supabase.functions.invoke("discord-notify-favorite", {
        body: {
          user_id: userId,
          title: item.title,
          content_type: item.content_type,
          release_date: item.release_date,
          poster_path: item.poster_path,
        },
      }).then(({ error: dmError }) => {
        if (!dmError) {
          toast.success("Check your Discord DMs! 🔔");
        }
      }).catch(() => {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      toast.success("You'll be notified when this releases!");
    },
    onError: () => toast.error("Failed to add to favorites"),
  });

  const removeFavorite = useMutation({
    mutationFn: async ({ tmdb_id, content_type }: { tmdb_id: number; content_type: string }) => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("tmdb_id", tmdb_id)
        .eq("content_type", content_type);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      toast.success("Removed from notifications");
    },
    onError: () => toast.error("Failed to remove"),
  });

  const isFavorited = (tmdb_id: number, content_type: string) =>
    favorites.some((f) => f.tmdb_id === tmdb_id && f.content_type === content_type);

  return { favorites, isLoading, addFavorite, removeFavorite, isFavorited, userId };
};
