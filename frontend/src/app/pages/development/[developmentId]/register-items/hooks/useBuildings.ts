import { useState, useCallback, useEffect } from "react";
import { buildApiUrl } from "@/lib/api";
import type { Building } from "../utils/types";

export const useBuildings = (developmentId: string) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        buildApiUrl(`/api/developments/${developmentId}/buildings`),
        {
          cache: "no-store",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok && data.data) {
        setBuildings(data.data);
      } else {
        throw new Error(data.message || "Erro ao buscar torres");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar torres";
      setError(errorMessage);
      console.error("Erro ao buscar torres:", err);
    } finally {
      setLoading(false);
    }
  }, [developmentId]);

  useEffect(() => {
    void fetchBuildings();
  }, [fetchBuildings]);

  return {
    buildings,
    loading,
    error,
    reload: fetchBuildings,
  };
};

