import { useCallback, useEffect, useState } from "react";

import { getCurrentCoordinates, type Coordinates } from "../services/locationService";

interface UseLocationResult {
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLocation(autoFetch = true): UseLocationResult {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const coords = await getCurrentCoordinates();
      if (!coords) {
        setError("Location permission denied");
      }
      setCoordinates(coords);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch location");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) void refresh();
  }, [autoFetch, refresh]);

  return { coordinates, isLoading, error, refresh };
}
