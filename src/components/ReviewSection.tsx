import { useState } from "react";
import { Star, Send, Trash2, MessageSquare, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useReviews } from "@/hooks/useReviews";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const MAX_REVIEW_LENGTH = 5000;

interface ReviewSectionProps {
  contentId: number;
  contentType: "movie" | "tv";
  isAuthenticated: boolean;
}

export const ReviewSection = ({ contentId, contentType, isAuthenticated }: ReviewSectionProps) => {
  const { reviews, userReview, submitReview, deleteReview, averageRating, isLoading } = useReviews(contentId, contentType);
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(userReview?.review_text || "");
  const [isWriting, setIsWriting] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    const trimmedText = reviewText.trim();
    if (trimmedText.length > MAX_REVIEW_LENGTH) {
      toast.error(`Review must be less than ${MAX_REVIEW_LENGTH.toLocaleString()} characters`);
      return;
    }
    submitReview.mutate({ rating, reviewText: trimmedText });
    setIsWriting(false);
  };

  const displayRating = hoverRating || rating;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Star className="h-5 w-5 text-primary fill-primary" />
          </div>
          <h2 className="text-xl font-bold font-display">Reviews</h2>
          {averageRating && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Star className="h-3.5 w-3.5 text-primary fill-primary" />
              <span className="font-bold text-sm">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({reviews?.length})</span>
            </div>
          )}
        </div>
        {isAuthenticated && !isWriting && !userReview && (
          <Button onClick={() => setIsWriting(true)} variant="outline" className="rounded-xl gap-2 border-border/40">
            <Pencil className="h-4 w-4" />
            Write Review
          </Button>
        )}
      </div>

      {/* Write Review Form */}
      <AnimatePresence>
        {isAuthenticated && (isWriting || userReview) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="p-6 rounded-2xl bg-card/70 backdrop-blur-sm border border-border/30 space-y-5"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-t-2xl" />
            <div className="flex items-center justify-between">
              <p className="font-bold font-display">{userReview ? "Your Review" : "Rate this title"}</p>
              {userReview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive rounded-lg"
                  onClick={() => deleteReview.mutate()}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-0.5 transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} out of 10`}
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      star <= displayRating
                        ? "text-primary fill-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
              <span className="ml-3 text-xl font-bold font-display text-primary">{displayRating}<span className="text-muted-foreground text-sm font-normal">/10</span></span>
            </div>

            {/* Review Text */}
            <div className="space-y-1.5">
              <Textarea
                placeholder="Share your thoughts (optional)..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[100px] resize-none rounded-xl bg-secondary/30 border-border/30 focus:border-primary/40"
                maxLength={MAX_REVIEW_LENGTH}
              />
              <p className={cn(
                "text-xs text-right",
                reviewText.length > MAX_REVIEW_LENGTH * 0.9 ? "text-destructive" : "text-muted-foreground"
              )}>
                {reviewText.length.toLocaleString()}/{MAX_REVIEW_LENGTH.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || submitReview.isPending}
                className="rounded-xl shadow-glow gap-2"
              >
                <Send className="h-4 w-4" />
                {submitReview.isPending ? "Submitting..." : userReview ? "Update" : "Submit"}
              </Button>
              {isWriting && (
                <Button variant="ghost" onClick={() => setIsWriting(false)} className="rounded-xl">
                  Cancel
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isAuthenticated && (
        <div className="text-center py-8 rounded-2xl bg-card/40 border border-border/20">
          <p className="text-muted-foreground text-sm">Sign in to write a review</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews?.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="p-5 rounded-2xl bg-card/50 border border-border/20 space-y-3 hover:border-border/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {review.display_name?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <span className="font-semibold text-sm block">{review.display_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10">
                <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                <span className="font-bold text-sm">{review.rating}</span>
              </div>
            </div>
            {review.review_text && (
              <p className="text-foreground/80 leading-relaxed text-sm">{review.review_text}</p>
            )}
          </motion.div>
        ))}

        {!isLoading && reviews?.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-card/30 border border-border/15">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-primary/60" />
            </div>
            <p className="text-muted-foreground text-sm">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </section>
  );
};
