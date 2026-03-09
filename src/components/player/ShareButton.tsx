import { useState } from "react";
import { Share2, Check, Copy, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface ShareButtonProps {
  contentId: number;
  contentType: "movie" | "tv";
  title: string;
  season?: number;
  episode?: number;
}

export const ShareButton = ({ contentId, contentType, title, season, episode }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    const base = window.location.origin;
    if (contentType === "tv") {
      return `${base}/tv/${contentId}?s=${season || 1}&e=${episode || 1}`;
    }
    return `${base}/movie/${contentId}`;
  };

  const handleCopy = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: `Watch ${title}`, url });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 md:h-11 md:w-11 text-white/80 hover:text-white hover:bg-white/10"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <p className="text-sm font-medium mb-2">Share this content</p>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" className="justify-start gap-2" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy link"}
          </Button>
          {typeof navigator.share === "function" && (
            <Button variant="outline" size="sm" className="justify-start gap-2" onClick={handleNativeShare}>
              <Share2 className="h-4 w-4" />
              Share via...
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
