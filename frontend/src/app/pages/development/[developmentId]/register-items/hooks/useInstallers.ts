import { useState, useCallback, useEffect } from "react";
import { buildApiUrl } from "@/lib/api";
import type { Installer } from "../utils/types";

export const useInstallers = () => {
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstallers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(buildApiUrl("/api/installers"), {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setInstallers(data.data);
      } else {
        throw new Error(data.message || "Erro ao buscar instaladores");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar instaladores";
      setError(errorMessage);
      console.error("Erro ao buscar instaladores:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInstallers();
  }, [fetchInstallers]);

  return {
    installers,
    loading,
    error,
  };
};

