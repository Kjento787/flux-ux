import { Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  contentId: number;
  contentType: "movie" | "tv";
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "glass" | "outline";
  showLabel?: boolean;
  className?: string;
}

export const WatchlistButton = ({
  contentId,
  contentType,
  size = "default",
  variant = "glass",
  showLabel = true,
  className,
}: WatchlistButtonProps) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const inList = isInWatchlist(contentId, contentType);
  const isPending = addToWatchlist.isPending || removeFromWatchlist.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inList) {
      removeFromWatchlist.mutate({ contentId, contentType });
    } else {
      addToWatchlist.mutate({ contentId, contentType });
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "transition-all",
        inList && "bg-primary/20 border-primary/50",
        className
      )}
      aria-label={inList ? "Remove from watchlist" : "Add to watchlist"}
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : inList ? (
        <Check className="h-5 w-5" />
      ) : (
        <Plus className="h-5 w-5" />
      )}
      {showLabel && (inList ? "In My List" : "Add to List")}
    </Button>
  );
};
