import { useState, useCallback, useEffect } from "react";
import { buildApiUrl } from "@/lib/api";
import type { Supplier } from "../utils/types";

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(buildApiUrl("/api/suppliers"), {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setSuppliers(data.data);
      } else {
        throw new Error(data.message || "Erro ao buscar fornecedores");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar fornecedores";
      setError(errorMessage);
      console.error("Erro ao buscar fornecedores:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
  };
};

