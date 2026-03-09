import { useState, useRef, useEffect, useCallback } from "react";
import { X, Maximize, Minimize, ShieldCheck, Server, Captions, AlertTriangle, SkipForward, SkipBack, ChevronDown, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EMBED_SERVERS, getEmbedUrl } from "@/lib/tmdb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
  contentId: number;
  contentType: "movie" | "tv";
  title: string;
  subtitle?: string;
  season?: number;
  episode?: number;
  totalEpisodes?: number;
  totalSeasons?: number;
  onClose: () => void;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  onEpisodeSelect?: (episode: number) => void;
  onSeasonSelect?: (season: number) => void;
}

export const VideoPlayer = ({ 
  contentId, 
  contentType, 
  title, 
  subtitle, 
  season,
  episode,
  totalEpisodes,
  totalSeasons,
  onClose,
  onNextEpisode,
  onPreviousEpisode,
  onEpisodeSelect,
  onSeasonSelect
}: VideoPlayerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState("vidsrcxyz");
  const [popupBlocked, setPopupBlocked] = useState(0);
  const [showEpisodeBar, setShowEpisodeBar] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const currentServer = EMBED_SERVERS.find(s => s.id === selectedServer) || EMBED_SERVERS[0];
  const embedUrl = getEmbedUrl(contentId, contentType, season, episode, selectedServer);

  const handleServerChange = (serverId: string) => {
    setIsLoading(true);
    setSelectedServer(serverId);
    setPopupBlocked(0);
  };

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = setTimeout(() => {
      if (!showEpisodeBar) {
        setControlsVisible(false);
      }
    }, 3000);
  }, [showEpisodeBar]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [resetHideTimer]);

  const toggleFullscreen = async () => {
    if (!playerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        if (playerRef.current.requestFullscreen) {
          await playerRef.current.requestFullscreen();
        } else if ((playerRef.current as any).webkitRequestFullscreen) {
          await (playerRef.current as any).webkitRequestFullscreen();
        } else if ((playerRef.current as any).mozRequestFullScreen) {
          await (playerRef.current as any).mozRequestFullScreen();
        } else if ((playerRef.current as any).msRequestFullscreen) {
          await (playerRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Block popups globally when video player is active
  useEffect(() => {
    const originalOpen = window.open;
    
    window.open = function(...args) {
      setPopupBlocked(prev => prev + 1);
      console.log('[Ad Blocker] Blocked popup:', args[0]);
      return null;
    };

    return () => {
      window.open = originalOpen;
    };
  }, []);

  // Block window.open calls and other popup methods
  useEffect(() => {
    const blockPopups = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && (target as HTMLAnchorElement).target === '_blank') {
        const href = (target as HTMLAnchorElement).href;
        if (href && (href.includes('ad') || href.includes('click') || href.includes('track') || href.includes('redirect'))) {
          e.preventDefault();
          e.stopPropagation();
          setPopupBlocked(prev => prev + 1);
        }
      }
    };

    document.addEventListener('click', blockPopups, true);
    return () => document.removeEventListener('click', blockPopups, true);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetHideTimer();
      
      if (e.key === "Escape" && !document.fullscreenElement) {
        onClose();
      }
      // Arrow keys for episode navigation
      if (contentType === "tv") {
        if (e.key === "ArrowRight" && e.shiftKey && onNextEpisode) {
          onNextEpisode();
        }
        if (e.key === "ArrowLeft" && e.shiftKey && onPreviousEpisode) {
          onPreviousEpisode();
        }
      }
      // Toggle episode bar
      if (e.key === "e" || e.key === "E") {
        setShowEpisodeBar(prev => !prev);
      }
      // Fullscreen toggle
      if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNextEpisode, onPreviousEpisode, contentType, resetHideTimer]);

  // Apply ad-blocker class to body when mounted
  useEffect(() => {
    document.body.classList.add('ad-blocker-active');
    return () => {
      document.body.classList.remove('ad-blocker-active');
    };
  }, []);

  const canGoPrevious = contentType === "tv" && episode !== undefined && (episode > 1 || (season !== undefined && season > 1));
  const canGoNext = contentType === "tv" && episode !== undefined && totalEpisodes !== undefined && 
    (episode < totalEpisodes || (totalSeasons !== undefined && season !== undefined && season < totalSeasons));

  return (
    <div 
      ref={playerRef} 
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onMouseMove={resetHideTimer}
    >
      {/* Top Header - Auto-hide */}
      <div className={cn(
        "absolute top-0 left-0 right-0 z-20 transition-all duration-300",
        controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Protected</span>
              {popupBlocked > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/30 rounded-full text-[10px] font-bold">
                  {popupBlocked}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm md:text-base font-semibold text-white line-clamp-1">{title}</h2>
              {subtitle && (
                <p className="text-xs text-white/60">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            {/* Server Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-white/80 hover:text-white hover:bg-white/10">
                  <Server className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs">{currentServer.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {EMBED_SERVERS.map((server) => (
                  <DropdownMenuItem 
                    key={server.id} 
                    onClick={() => handleServerChange(server.id)}
                    className={cn(selectedServer === server.id && "bg-primary/10 text-primary")}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{server.name}</span>
                      {server.hasSubtitles && (
                        <Captions className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen} 
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 w-full relative overflow-hidden video-player-container">
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-primary/30 border-t-primary" />
              </div>
              <p className="text-white/60 text-sm">Loading {currentServer.name}...</p>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          key={`${selectedServer}-${season}-${episode}`}
          src={embedUrl}
          className={cn(
            "w-full h-full transition-opacity duration-500",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          allowFullScreen={true}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
          style={{ 
            border: 'none',
            display: 'block',
            width: '100%',
            height: '100%'
          }}
        />

        {/* Click interceptor overlays */}
        <div 
          className="absolute top-0 left-0 right-0 h-3 bg-transparent cursor-default" 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-3 bg-transparent cursor-default" 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
        <div 
          className="absolute top-0 bottom-0 left-0 w-3 bg-transparent cursor-default" 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
        <div 
          className="absolute top-0 bottom-0 right-0 w-3 bg-transparent cursor-default" 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
      </div>

      {/* Bottom Episode Navigation Bar - TV Shows Only */}
      {contentType === "tv" && (
        <div className={cn(
          "absolute bottom-0 left-0 right-0 z-20 transition-all duration-300",
          controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}>
          <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-8 pb-4 px-4">
            {/* Episode Quick Navigation */}
            <div className="flex items-center justify-between gap-4">
              {/* Previous Episode */}
              <Button 
                variant="ghost" 
                size="lg"
                onClick={onPreviousEpisode}
                disabled={!canGoPrevious}
                className={cn(
                  "h-12 px-4 gap-2 text-white transition-all duration-200",
                  canGoPrevious 
                    ? "hover:bg-white/10 hover:scale-105" 
                    : "opacity-30 cursor-not-allowed"
                )}
              >
                <SkipBack className="h-5 w-5" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {/* Center - Episode Info & Quick Select */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  {/* Season Select */}
                  {totalSeasons && totalSeasons > 1 && onSeasonSelect && (
                    <Select 
                      value={String(season)} 
                      onValueChange={(v) => onSeasonSelect(Number(v))}
                    >
                      <SelectTrigger className="w-28 h-9 bg-white/10 border-white/20 text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                          <SelectItem key={s} value={String(s)}>
                            Season {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {/* Episode Select */}
                  {totalEpisodes && onEpisodeSelect && (
                    <Select 
                      value={String(episode)} 
                      onValueChange={(v) => onEpisodeSelect(Number(v))}
                    >
                      <SelectTrigger className="w-32 h-9 bg-white/10 border-white/20 text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                          <SelectItem key={ep} value={String(ep)}>
                            Episode {ep}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                {/* Episode Progress Bar */}
                {totalEpisodes && episode && (
                  <div className="w-full max-w-md">
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalEpisodes, 20) }, (_, i) => i + 1).map((ep) => (
                        <button
                          key={ep}
                          onClick={() => onEpisodeSelect?.(ep)}
                          className={cn(
                            "flex-1 h-1.5 rounded-full transition-all duration-200",
                            ep === episode 
                              ? "bg-primary scale-y-150" 
                              : ep < episode 
                                ? "bg-primary/50 hover:bg-primary/70" 
                                : "bg-white/20 hover:bg-white/40"
                          )}
                          title={`Episode ${ep}`}
                        />
                      ))}
                    </div>
                    {totalEpisodes > 20 && (
                      <p className="text-center text-white/40 text-xs mt-1">
                        Showing first 20 of {totalEpisodes} episodes
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Next Episode */}
              <Button 
                variant="default"
                size="lg"
                onClick={onNextEpisode}
                disabled={!canGoNext}
                className={cn(
                  "h-12 px-6 gap-2 transition-all duration-200",
                  canGoNext 
                    ? "bg-primary hover:bg-primary/90 hover:scale-105 shadow-lg shadow-primary/30" 
                    : "opacity-30 cursor-not-allowed"
                )}
              >
                <span className="hidden sm:inline">Next Episode</span>
                <span className="sm:hidden">Next</span>
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="flex justify-center mt-3">
              <div className="flex items-center gap-4 text-white/30 text-xs">
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">←→</kbd> Navigate</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">F</kbd> Fullscreen</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Esc</kbd> Close</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Server Notice - Only for movies */}
      {contentType === "movie" && (
        <div className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 z-20 transition-all duration-300",
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-sm text-white/60 text-xs">
            <AlertTriangle className="h-3 w-3" />
            <span>If ads appear, try a different server</span>
          </div>
        </div>
      )}
    </div>
  );
};