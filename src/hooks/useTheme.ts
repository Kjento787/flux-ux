import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Theme = "light" | "dark" | "system";

export type ColorTheme = "default" | "ocean" | "crimson" | "emerald" | "violet" | "rose" | "teal" | "sunset" | "cyber";

export const COLOR_THEMES: { value: ColorTheme; label: string; color: string }[] = [
  { value: "default", label: "Amber", color: "hsl(35 85% 55%)" },
  { value: "ocean", label: "Ocean", color: "hsl(210 80% 55%)" },
  { value: "crimson", label: "Crimson", color: "hsl(0 75% 55%)" },
  { value: "emerald", label: "Emerald", color: "hsl(150 70% 45%)" },
  { value: "violet", label: "Violet", color: "hsl(270 70% 60%)" },
  { value: "rose", label: "Rose", color: "hsl(340 75% 60%)" },
  { value: "teal", label: "Teal", color: "hsl(175 70% 45%)" },
  { value: "sunset", label: "Sunset", color: "hsl(25 90% 55%)" },
  { value: "cyber", label: "Cyber", color: "hsl(50 90% 50%)" },
];

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("default");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      const stored = localStorage.getItem("theme") as Theme | null;
      const storedColor = localStorage.getItem("colorTheme") as ColorTheme | null;
      
      if (stored) {
        setThemeState(stored);
        applyTheme(stored);
      }
      if (storedColor) {
        setColorThemeState(storedColor);
        applyColorTheme(storedColor);
      }

      if (stored || storedColor) {
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("theme_preference")
          .eq("id", user.id)
          .single();
        
        if (data?.theme_preference) {
          setThemeState(data.theme_preference as Theme);
          applyTheme(data.theme_preference as Theme);
          localStorage.setItem("theme", data.theme_preference);
        }
      }
      setIsLoading(false);
    };

    loadTheme();
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (newTheme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(systemPrefersDark ? "dark" : "light");
    } else {
      root.classList.add(newTheme);
    }
  };

  const applyColorTheme = (ct: ColorTheme) => {
    const root = document.documentElement;
    if (ct === "default") {
      root.removeAttribute("data-color-theme");
    } else {
      root.setAttribute("data-color-theme", ct);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ theme_preference: newTheme })
        .eq("id", user.id);
    }
  };

  const setColorTheme = (ct: ColorTheme) => {
    setColorThemeState(ct);
    applyColorTheme(ct);
    localStorage.setItem("colorTheme", ct);
  };

  return { theme, setTheme, colorTheme, setColorTheme, isLoading };
};