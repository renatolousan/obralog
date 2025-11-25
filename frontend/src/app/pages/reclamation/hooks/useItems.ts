import { useState, useCallback, useEffect } from "react";
import { buildApiUrl } from "@/lib/api";
import type { ItemOption, ApiListResponse } from "../utils/types";

export const useItems = () => {
  const [items, setItems] = useState<ItemOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJson = useCallback(async <T,>(url: string): Promise<T> => {
    const res = await fetch(buildApiUrl(url), {
      cache: "no-store",
      credentials: "include",
    });
    const payload = (await res.json().catch(() => null)) as
      | ApiListResponse<T>
      | null;

    if (!res.ok) {
      const message = payload?.message ?? `Erro ${res.status}`;
      throw new Error(message);
    }

    return (payload?.data ?? payload) as T;
  }, []);

  const loadUserItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchJson<{
        id: string;
        name: string;
        email: string;
        unitId: string | null;
        unit: {
          id: string;
          nome: string;
          numero: number;
          andar: number;
          itens: ItemOption[];
        } | null;
      }>("/api/users/me");

      if (data?.unit?.itens) {
        setItems(data.unit.itens);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os itens"
      );
    } finally {
      setLoading(false);
    }
  }, [fetchJson]);

  useEffect(() => {
    void loadUserItems();
  }, [loadUserItems]);

  return {
    items,
    loading,
    error,
    reload: loadUserItems,
  };
};

