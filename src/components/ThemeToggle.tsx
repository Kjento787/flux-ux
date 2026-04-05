import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme, COLOR_THEMES } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
  const { colorTheme, setColorTheme } = useTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Palette className="h-4 w-4" />
          <span className="hidden md:inline">Theme</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Choose Theme</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 py-4">
          {COLOR_THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setColorTheme(t.value)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                colorTheme === t.value
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-border"
              )}
            >
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full shadow-md"
                  style={{ backgroundColor: t.color }}
                />
                {colorTheme === t.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white drop-shadow-md" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};