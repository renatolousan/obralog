import { useState, useCallback, useEffect } from "react";
import { buildApiUrl } from "@/lib/api";
import type { Reclamacao } from "../utils/types";

export const useReclamacoes = (developmentId: string | undefined) => {
  const [reclamacoes, setReclamacoes] = useState<Reclamacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReclamacoes = useCallback(
    async (signal?: AbortSignal) => {
      if (!developmentId) return;

      try {
        setLoading(true);
        setError(null);

        const url = buildApiUrl(
          `/api/developments/${developmentId}/reclamacoes`
        );

        const response = await fetch(url, {
          method: "GET",
          signal,
          cache: "no-store",
          credentials: "include",
        });

        const payload = (await response.json().catch(() => null)) as
          | Reclamacao[]
          | null;

        if (!response.ok) {
          throw new Error(`Erro ${response.status}`);
        }

        const data = Array.isArray(payload) ? payload : [];
        setReclamacoes(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setReclamacoes([]);
        setError(
          err instanceof Error
            ? err.message
            : "Erro inesperado ao carregar reclamacoes"
        );
      } finally {
        setLoading(false);
      }
    },
    [developmentId]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadReclamacoes(controller.signal);
    return () => controller.abort();
  }, [loadReclamacoes]);

  return {
    reclamacoes,
    loading,
    error,
    reload: loadReclamacoes,
  };
};

