import { useState, useEffect } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface ManagerialDashboardData {
  topItems: Array<{
    id: string;
    name: string;
    description: string;
    supplier: string | null;
    building: string | null;
    totalFeedbacks: number;
  }>;
  topSuppliers: Array<{
    supplier: string;
    cnpj: string;
    totalFeedbacks: number;
  }>;
  topInstallers: Array<{
    installer: string;
    cpf: string;
    totalFeedbacks: number;
  }>;
}

export function useManagerialDashboard() {
  const [data, setData] = useState<ManagerialDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [itemsRes, suppliersRes, installersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/analytics/managerial/top-items`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/analytics/managerial/top-suppliers`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/analytics/managerial/top-installers`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }),
        ]);

        if (!itemsRes.ok) {
          const errorText = await itemsRes.text();
          throw new Error(
            `Erro ao buscar itens: ${itemsRes.status} - ${errorText}`
          );
        }
        if (!suppliersRes.ok) {
          const errorText = await suppliersRes.text();
          throw new Error(
            `Erro ao buscar fornecedores: ${suppliersRes.status} - ${errorText}`
          );
        }
        if (!installersRes.ok) {
          const errorText = await installersRes.text();
          throw new Error(
            `Erro ao buscar instaladores: ${installersRes.status} - ${errorText}`
          );
        }

        const [itemsData, suppliersData, installersData] = await Promise.all([
          itemsRes.json().catch(() => ({ data: [] })),
          suppliersRes.json().catch(() => ({ data: [] })),
          installersRes.json().catch(() => ({ data: [] })),
        ]);

        setData({
          topItems: itemsData.data || [],
          topSuppliers: suppliersData.data || [],
          topInstallers: installersData.data || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

