import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Review {
  id: string;
  user_id: string;
  content_id: number;
  content_type: "movie" | "tv";
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  is_approved: boolean;
  user_email?: string;
  display_name?: string;
}

export const useReviews = (contentId: number, contentType: "movie" | "tv") => {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", contentId, contentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("content_id", contentId)
        .eq("content_type", contentType)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch display names
      const reviewsWithNames = await Promise.all(
        (data || []).map(async (review) => {
          const { data: profile } = await supabase
            .from("public_profiles")
            .select("display_name")
            .eq("id", review.user_id)
            .single();
          return { ...review, display_name: profile?.display_name || "Anonymous" };
        })
      );

      return reviewsWithNames as Review[];
    },
    enabled: !!contentId,
  });

  const { data: userReview } = useQuery({
    queryKey: ["user-review", contentId, contentType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .eq("content_id", contentId)
        .eq("content_type", contentType)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as Review | null;
    },
    enabled: !!contentId,
  });

  const submitReview = useMutation({
    mutationFn: async ({ rating, reviewText }: { rating: number; reviewText?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("reviews").upsert({
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        rating,
        review_text: reviewText || null,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", contentId, contentType] });
      queryClient.invalidateQueries({ queryKey: ["user-review", contentId, contentType] });
      toast.success("Review submitted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteReview = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("user_id", user.id)
        .eq("content_id", contentId)
        .eq("content_type", contentType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", contentId, contentType] });
      queryClient.invalidateQueries({ queryKey: ["user-review", contentId, contentType] });
      toast.success("Review deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const averageRating = reviews?.length
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : null;

  return {
    reviews,
    userReview,
    isLoading,
    submitReview,
    deleteReview,
    averageRating,
  };
};
