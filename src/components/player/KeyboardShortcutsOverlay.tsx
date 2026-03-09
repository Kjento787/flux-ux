import { X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShortcutItem {
  keys: string[];
  description: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ["F"], description: "Toggle fullscreen" },
  { keys: ["Esc"], description: "Exit player" },
  { keys: ["?"], description: "Toggle shortcuts" },
  { keys: ["Shift", "→"], description: "Next episode" },
  { keys: ["Shift", "←"], description: "Previous episode" },
];

interface KeyboardShortcutsOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsOverlay = ({ visible, onClose }: KeyboardShortcutsOverlayProps) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Keyboard Shortcuts</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {SHORTCUTS.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <span key={j}>
                    <kbd className="px-2 py-1 text-xs font-mono font-semibold bg-muted text-foreground rounded border border-border">
                      {key}
                    </kbd>
                    {j < shortcut.keys.length - 1 && <span className="text-muted-foreground mx-0.5">+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
