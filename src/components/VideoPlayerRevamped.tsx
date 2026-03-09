import { useState, useRef, useEffect, useCallback } from "react";
import { 
  X, Maximize, Minimize, ShieldCheck, Server, Captions, 
  SkipForward, SkipBack, ChevronDown, Check,
  Tv, Monitor, Smartphone, Keyboard, AlertTriangle, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EMBED_SERVERS, getEmbedUrl } from "@/lib/tmdb";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KeyboardShortcutsOverlay } from "@/components/player/KeyboardShortcutsOverlay";
import { ShareButton } from "@/components/player/ShareButton";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useAdBlocker } from "@/hooks/useAdBlocker";
import { useServerHealth } from "@/hooks/useServerHealth";

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

export const VideoPlayerRevamped = ({ 
  contentId, contentType, title, subtitle, season, episode,
  totalEpisodes, totalSeasons, onClose, onNextEpisode, onPreviousEpisode,
  onEpisodeSelect, onSeasonSelect
}: VideoPlayerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState("vidsrcxyz");
  const [popupBlocked, setPopupBlocked] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [serverPanelOpen, setServerPanelOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [swipeHint, setSwipeHint] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { addToHistory } = useWatchHistory();
  const { enabled: adBlockerEnabled } = useAdBlocker();
  const { reportFailure, reportSuccess, getAliveServers, isServerDead } = useServerHealth();

  const aliveServers = getAliveServers(EMBED_SERVERS);
  const currentServer = aliveServers.find(s => s.id === selectedServer) || aliveServers[0];
  const embedUrl = getEmbedUrl(contentId, contentType, season, episode, currentServer.id);

  useEffect(() => {
    if (isServerDead(selectedServer) && aliveServers.length > 0) {
      const next = aliveServers[0];
      setSelectedServer(next.id);
      setIsLoading(true);
    }
  }, [selectedServer, isServerDead, aliveServers]);

  const handleServerChange = (serverId: string) => {
    setIsLoading(true);
    setSelectedServer(serverId);
    setPopupBlocked(0);
    setServerPanelOpen(false);
  };

  useEffect(() => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        reportFailure(currentServer.id);
        const remaining = aliveServers.filter(s => s.id !== currentServer.id);
        if (remaining.length > 0) {
          setSelectedServer(remaining[0].id);
          setIsLoading(true);
        }
      }
    }, 15000);
    return () => { if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current); };
  }, [currentServer.id, isLoading, aliveServers]);

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (!serverPanelOpen) setControlsVisible(false);
    }, 3000);
  }, [serverPanelOpen]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current); };
  }, [resetHideTimer]);

  const toggleFullscreen = async () => {
    if (!playerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        if (playerRef.current.requestFullscreen) await playerRef.current.requestFullscreen();
        else if ((playerRef.current as any).webkitRequestFullscreen) await (playerRef.current as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  useEffect(() => {
    if (!adBlockerEnabled) return;
    const originalOpen = window.open;
    window.open = function(...args) { setPopupBlocked(prev => prev + 1); return null; };
    return () => { window.open = originalOpen; };
  }, [adBlockerEnabled]);

  useEffect(() => {
    addToHistory({ contentId, contentType, title, posterPath: null, season, episode, server: selectedServer });
  }, [contentId, contentType, season, episode, selectedServer]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetHideTimer();
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "?") setShowShortcuts(prev => !prev);
      if (contentType === "tv") {
        if (e.key === "ArrowRight" && e.shiftKey && onNextEpisode) onNextEpisode();
        if (e.key === "ArrowLeft" && e.shiftKey && onPreviousEpisode) onPreviousEpisode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNextEpisode, onPreviousEpisode, contentType, resetHideTimer]);

  useEffect(() => {
    if (adBlockerEnabled) {
      document.body.classList.add('ad-blocker-active');
      return () => document.body.classList.remove('ad-blocker-active');
    }
  }, [adBlockerEnabled]);

  const canGoPrevious = contentType === "tv" && episode !== undefined && (episode > 1 || (season !== undefined && season > 1));
  const canGoNext = contentType === "tv" && episode !== undefined && totalEpisodes !== undefined && 
    (episode < totalEpisodes || (totalSeasons !== undefined && season !== undefined && season < totalSeasons));

  return (
    <div 
      ref={playerRef} 
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onMouseMove={resetHideTimer}
      onTouchStart={(e) => {
        resetHideTimer();
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      }}
      onTouchEnd={(e) => {
        if (!touchStartRef.current) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;
        const dt = Date.now() - touchStartRef.current.time;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        touchStartRef.current = null;

        if (absDx > 80 && absDx > absDy * 1.5 && dt < 500) {
          if (dx > 0 && canGoPrevious && onPreviousEpisode) {
            onPreviousEpisode();
            setSwipeHint("⏮ Previous Episode");
            setTimeout(() => setSwipeHint(null), 1500);
          } else if (dx < 0 && canGoNext && onNextEpisode) {
            onNextEpisode();
            setSwipeHint("⏭ Next Episode");
            setTimeout(() => setSwipeHint(null), 1500);
          }
        }
      }}
    >
      {/* Holographic Top Header */}
      <div className={cn(
        "absolute top-0 left-0 right-0 z-30 transition-all duration-500",
        controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className="flex items-center justify-between p-3 md:p-4 lg:p-6 bg-gradient-to-b from-black via-black/80 to-transparent">
          {/* Holographic accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-holo-cyan/50 to-transparent" />
          
          {/* Left - Title & Protection */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="h-10 w-10 md:h-12 md:w-12 text-white/90 hover:text-white hover:bg-white/10 rounded-xl flex-shrink-0"
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="min-w-0">
              <h2 className="text-base md:text-lg lg:text-xl font-bold text-white truncate font-display">{title}</h2>
              {subtitle && <p className="text-sm text-white/60 truncate">{subtitle}</p>}
            </div>
            {adBlockerEnabled && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-holo-cyan/20 to-primary/20 border border-holo-cyan/30 text-holo-cyan text-xs font-medium flex-shrink-0 shadow-neon">
                <ShieldCheck className="h-4 w-4" />
                <span>Protected</span>
                {popupBlocked > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-holo-cyan/30 rounded-full text-[10px] font-bold">
                    {popupBlocked}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Right - Controls */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Sheet open={serverPanelOpen} onOpenChange={setServerPanelOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-10 md:h-11 px-3 md:px-4 gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white hover:border-primary/50 rounded-xl transition-all"
                >
                  <Server className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">{currentServer.name}</span>
                  <span className="sm:hidden text-sm">Server</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] md:h-[60vh] rounded-t-3xl glass-strong border-t-2 border-primary/30">
                <SheetHeader className="pb-4 border-b border-border/30">
                  <SheetTitle className="text-xl font-bold flex items-center gap-2 font-display">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-holo-indigo">
                      <Server className="h-5 w-5 text-primary-foreground" />
                    </div>
                    Select Server
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-80px)] mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-4">
                    {EMBED_SERVERS.map((server) => {
                      const dead = isServerDead(server.id);
                      return (
                        <button
                          key={server.id}
                          onClick={() => !dead && handleServerChange(server.id)}
                          disabled={dead}
                          className={cn(
                            "relative p-4 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden group",
                            dead
                              ? "border-destructive/30 bg-destructive/5 opacity-50 cursor-not-allowed"
                              : "hover:scale-[1.02] hover:shadow-hover",
                            !dead && selectedServer === server.id
                              ? "border-primary bg-gradient-to-br from-primary/10 to-holo-indigo/10 shadow-neon"
                              : !dead && "border-border/30 bg-surface-1/50 hover:border-primary/50"
                          )}
                        >
                          {/* Shimmer effect on selected */}
                          {selectedServer === server.id && !dead && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
                          )}
                          
                          <div className="relative flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg font-display">{server.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {dead ? (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                                    <AlertTriangle className="h-3 w-3" />
                                    Unavailable
                                  </span>
                                ) : server.hasSubtitles && (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-holo-cyan/20 text-holo-cyan border border-holo-cyan/30">
                                    <Captions className="h-3 w-3" />
                                    Subtitles
                                  </span>
                                )}
                              </div>
                            </div>
                            {!dead && selectedServer === server.id && (
                              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-primary to-holo-cyan flex items-center justify-center shadow-neon">
                                <Check className="h-4 w-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 mt-3 text-muted-foreground">
                            <Smartphone className="h-4 w-4" aria-label="Mobile" />
                            <Monitor className="h-4 w-4" aria-label="Desktop" />
                            <Tv className="h-4 w-4" aria-label="TV" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <ShareButton contentId={contentId} contentType={contentType} title={title} season={season} episode={episode} />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShortcuts(true)}
              className="hidden md:flex h-10 w-10 md:h-11 md:w-11 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="h-5 w-5" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen} 
              className="h-10 w-10 md:h-11 md:w-11 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Swipe Hint */}
      {swipeHint && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 glass-strong px-6 py-3 rounded-2xl text-white text-lg font-bold pointer-events-none animate-scale-in shadow-neon">
          {swipeHint}
        </div>
      )}

      {/* Video Container */}
      <div className="flex-1 w-full relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary via-holo-cyan to-holo-magenta blur-xl opacity-50 animate-spin-slow" />
                <div className="relative animate-spin rounded-full h-14 w-14 border-4 border-primary/30 border-t-primary" />
              </div>
              <p className="text-white/60 text-sm font-medium">Loading {currentServer.name}...</p>
            </div>
          </div>
        )}

        <iframe
          key={`${selectedServer}-${season}-${episode}`}
          src={embedUrl}
          className={cn(
            "w-full h-full transition-opacity duration-500",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          allowFullScreen={true}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          referrerPolicy="no-referrer"
          onLoad={() => { setIsLoading(false); reportSuccess(currentServer.id); }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
          style={{ border: 'none' }}
        />
      </div>

      {/* Bottom Controls - TV Shows */}
      {contentType === "tv" && (
        <div className={cn(
          "absolute bottom-0 left-0 right-0 z-30 transition-all duration-500",
          controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}>
          <div className="bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-6 px-4 md:px-6 lg:px-8">
            {/* Holographic accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            {/* Episode Navigation */}
            <div className="flex items-center justify-center gap-4">
              {onPreviousEpisode && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onPreviousEpisode}
                  disabled={!canGoPrevious}
                  className="gap-2 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-xl"
                >
                  <SkipBack className="h-5 w-5" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              )}

              {/* Episode/Season selector */}
              {onEpisodeSelect && totalEpisodes && (
                <Select value={String(episode)} onValueChange={(v) => onEpisodeSelect(Number(v))}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white rounded-xl">
                    <SelectValue placeholder="Episode" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border/30">
                    {Array.from({ length: totalEpisodes }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>Episode {i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {onSeasonSelect && totalSeasons && (
                <Select value={String(season)} onValueChange={(v) => onSeasonSelect(Number(v))}>
                  <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white rounded-xl">
                    <SelectValue placeholder="Season" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border/30">
                    {Array.from({ length: totalSeasons }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>Season {i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {onNextEpisode && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onNextEpisode}
                  disabled={!canGoNext}
                  className="gap-2 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-xl"
                >
                  <span className="hidden sm:inline">Next</span>
                  <SkipForward className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcutsOverlay visible={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
};
