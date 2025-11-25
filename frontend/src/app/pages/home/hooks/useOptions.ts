import { useState, useCallback } from "react";
import { buildApiUrl } from "@/lib/api";
import type { Option, ItemOption, ListResponse } from "../utils/types";

export const useOptions = () => {
  const [itemOptions, setItemOptions] = useState<ItemOption[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<Option[]>([]);
  const [installerOptions, setInstallerOptions] = useState<Option[]>([]);

  const [loadingOptions, setLoadingOptions] = useState({
    items: false,
    suppliers: false,
    installers: false,
  });

  const updateLoadingOption = useCallback(
    (key: keyof typeof loadingOptions, value: boolean) => {
      setLoadingOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const fetchList = useCallback(async <T,>(path: string): Promise<T> => {
    const response = await fetch(buildApiUrl(path), {
      cache: "no-store",
      credentials: "include",
    });
    const payload = (await response
      .json()
      .catch(() => null)) as ListResponse<T> | null;

    if (!response.ok) {
      throw new Error(payload?.message ?? `Erro ${response.status}`);
    }

    return (payload?.data ?? []) as T;
  }, []);

  const loadUserItems = useCallback(async () => {
    try {
      updateLoadingOption("items", true);
      const response = await fetch(buildApiUrl("/api/users/me"), {
        cache: "no-store",
        credentials: "include",
      });
      const payload = (await response
        .json()
        .catch(() => null)) as ListResponse<{
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
      }> | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Erro ${response.status}`);
      }

      if (payload?.data?.unit?.itens) {
        setItemOptions(payload.data.unit.itens);
      }
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Não foi possível carregar os itens");
    } finally {
      updateLoadingOption("items", false);
    }
  }, [updateLoadingOption]);

  const loadSuppliers = useCallback(async () => {
    try {
      updateLoadingOption("suppliers", true);
      const data = await fetchList<Option[]>("/api/suppliers");
      setSupplierOptions(data ?? []);
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Não foi possível carregar fornecedores");
    } finally {
      updateLoadingOption("suppliers", false);
    }
  }, [fetchList, updateLoadingOption]);

  const loadInstallers = useCallback(async () => {
    try {
      updateLoadingOption("installers", true);
      const data = await fetchList<Option[]>("/api/installers");
      setInstallerOptions(data ?? []);
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Não foi possível carregar instaladores");
    } finally {
      updateLoadingOption("installers", false);
    }
  }, [fetchList, updateLoadingOption]);

  return {
    itemOptions,
    supplierOptions,
    installerOptions,
    loadingOptions,
    loadUserItems,
    loadSuppliers,
    loadInstallers,
  };
};

