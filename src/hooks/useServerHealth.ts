import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "bloxwave_server_health";
const FAILURE_THRESHOLD = 3; // Mark as dead after 3 consecutive failures
const RECOVERY_INTERVAL = 30 * 60 * 1000; // Re-check dead servers every 30 minutes

interface ServerHealthRecord {
  failures: number;
  lastFailure: number;
  lastSuccess: number;
  isDead: boolean;
}

type HealthMap = Record<string, ServerHealthRecord>;

const getStoredHealth = (): HealthMap => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveHealth = (health: HealthMap) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(health));
};

const defaultRecord = (): ServerHealthRecord => ({
  failures: 0,
  lastFailure: 0,
  lastSuccess: 0,
  isDead: false,
});

export const useServerHealth = () => {
  const [health, setHealth] = useState<HealthMap>(getStoredHealth);

  // Periodically revive dead servers for re-testing
  useEffect(() => {
    const interval = setInterval(() => {
      setHealth((prev) => {
        const now = Date.now();
        let changed = false;
        const updated = { ...prev };
        for (const id of Object.keys(updated)) {
          if (updated[id].isDead && now - updated[id].lastFailure > RECOVERY_INTERVAL) {
            updated[id] = { ...updated[id], failures: 0, isDead: false };
            changed = true;
          }
        }
        if (changed) saveHealth(updated);
        return changed ? updated : prev;
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const reportFailure = useCallback((serverId: string) => {
    setHealth((prev) => {
      const record = prev[serverId] || defaultRecord();
      const failures = record.failures + 1;
      const isDead = failures >= FAILURE_THRESHOLD;
      const updated = {
        ...prev,
        [serverId]: { ...record, failures, lastFailure: Date.now(), isDead },
      };
      saveHealth(updated);
      return updated;
    });
  }, []);

  const reportSuccess = useCallback((serverId: string) => {
    setHealth((prev) => {
      const updated = {
        ...prev,
        [serverId]: { ...defaultRecord(), lastSuccess: Date.now() },
      };
      saveHealth(updated);
      return updated;
    });
  }, []);

  const isServerDead = useCallback(
    (serverId: string) => health[serverId]?.isDead ?? false,
    [health]
  );

  const getAliveServers = useCallback(
    <T extends { id: string }>(servers: T[]): T[] => {
      const alive = servers.filter((s) => !isServerDead(s.id));
      // Always return at least one server so the user isn't stuck
      return alive.length > 0 ? alive : servers.slice(0, 1);
    },
    [isServerDead]
  );

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHealth({});
  }, []);

  return { reportFailure, reportSuccess, isServerDead, getAliveServers, resetAll, health };
};
