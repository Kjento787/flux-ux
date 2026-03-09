import { useState, useCallback } from "react";

const AD_BLOCKER_KEY = "bloxwave_ad_blocker_enabled";

export const useAdBlocker = () => {
  const [enabled, setEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(AD_BLOCKER_KEY);
      return stored !== null ? stored === "true" : true; // enabled by default
    } catch {
      return true;
    }
  });

  const toggle = useCallback((value: boolean) => {
    setEnabled(value);
    localStorage.setItem(AD_BLOCKER_KEY, String(value));
  }, []);

  return { enabled, toggle };
};
