import { useState, useCallback } from "react";
import { buildApiUrl } from "@/lib/api";
import type { InstallerOption } from "../utils/types";

export const useInstallers = () => {
  const [installers, setInstallers] = useState<InstallerOption[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInstallers = useCallback(async () => {
    try {
      setLoading(true);
      const url = buildApiUrl("/api/installers");
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const payload = (await response.json().catch(() => null)) as {
        data: InstallerOption[];
      } | null;

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const data = Array.isArray(payload?.data) ? payload.data : [];
      setInstallers(data);
    } catch (err) {
      console.error("Erro ao carregar instaladores:", err);
      setInstallers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    installers,
    loading,
    loadInstallers,
  };
};

