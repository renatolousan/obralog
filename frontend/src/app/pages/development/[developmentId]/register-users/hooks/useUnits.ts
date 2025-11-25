import { useState, useCallback, useEffect } from "react";
import { buildApiUrl } from "@/lib/api";
import type { Unit } from "../utils/types";

export const useUnits = (buildingId: string | null) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(buildApiUrl(`/api/buildings/${id}/units`), {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.data) {
          setUnits(data.data);
        } else {
          throw new Error(data.message || "Erro ao buscar unidades");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao buscar unidades";
        setError(errorMessage);
        console.error("Erro ao buscar unidades:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (buildingId) {
      void fetchUnits(buildingId);
    } else {
      setUnits([]);
    }
  }, [buildingId, fetchUnits]);

  return {
    units,
    loading,
    error,
  };
};

