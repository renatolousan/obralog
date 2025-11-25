import { useState, useCallback, useEffect } from "react";
import { buildApiUrl } from "@/lib/api";
import type { Atividade, Filters, ListResponse } from "../utils/types";

export const useActivities = (filters: Filters, searchTerm: string) => {
  const [activities, setActivities] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const loadActivities = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (searchTerm) params.set("search", searchTerm);
        if (filters.startDate) params.set("start_date", filters.startDate);
        if (filters.endDate) params.set("end_date", filters.endDate);
        if (filters.itemId) params.set("item_id", filters.itemId);
        if (filters.supplierId) params.set("supplier_id", filters.supplierId);
        if (filters.installerId)
          params.set("installer_id", filters.installerId);
        if (filters.statuses.length)
          params.set("status", filters.statuses.join(","));

        const query = params.toString();
        const url = buildApiUrl(`/api/reclamation${query ? `?${query}` : ""}`);

        const response = await fetch(url, {
          method: "GET",
          signal,
          cache: "no-store",
          credentials: "include",
        });

        const payload = (await response.json().catch(() => null)) as
          | (ListResponse<Atividade[]> & { total?: number })
          | null;

        if (!response.ok) {
          throw new Error(payload?.message ?? `Erro ${response.status}`);
        }

        const data = Array.isArray(payload?.data) ? payload!.data! : [];
        setActivities(data);
        setTotal(
          typeof payload?.total === "number" ? payload.total : data.length
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setActivities([]);
        setTotal(0);
        setError(
          err instanceof Error
            ? err.message
            : "Erro inesperado ao carregar reclamacoes"
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, searchTerm]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadActivities(controller.signal);
    return () => controller.abort();
  }, [loadActivities]);

  return {
    activities,
    loading,
    error,
    total,
    reload: loadActivities,
  };
};

