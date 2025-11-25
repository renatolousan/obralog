import { useState, useEffect } from "react";
import { AnalyticsData } from "../types/analytics";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Debug: Log da URL base
console.log("API_BASE_URL:", API_BASE_URL);

// Função para validar e tratar sugestões da IA
function validateSuggestion(suggestion?: string): string {
  if (!suggestion || typeof suggestion !== "string") {
    return "";
  }

  const trimmedSuggestion = suggestion.trim();

  // Se é string vazia
  if (trimmedSuggestion === "") {
    return "";
  }

  // Se contém indicadores de erro
  const errorKeywords = [
    "erro",
    "error",
    "falha",
    "failed",
    "exception",
    "null",
    "undefined",
  ];
  const hasError = errorKeywords.some((keyword) =>
    trimmedSuggestion.toLowerCase().includes(keyword)
  );

  if (hasError) {
    return "";
  }

  // Se é muito curta (possivelmente inválida)
  if (trimmedSuggestion.length < 10) {
    return "";
  }

  // Se contém apenas caracteres especiais ou números
  if (!/[a-zA-Z]/.test(trimmedSuggestion)) {
    return "";
  }

  return trimmedSuggestion;
}

export function useAnalytics(developmentId: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [suppliersRes, installersRes, buildingsRes, itemsRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/analytics/suppliers/incidents`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ developmentId }),
            }),
            fetch(`${API_BASE_URL}/analytics/installers/incidents`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ developmentId }),
            }),
            fetch(`${API_BASE_URL}/analytics/buildings/incidents`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ developmentId }),
            }),
            fetch(`${API_BASE_URL}/analytics/items/incidents`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ developmentId }),
            }),
          ]);

        // Debug: Log das responses
        console.log("Suppliers response:", suppliersRes);
        console.log("Installers response:", installersRes);
        console.log("Buildings response:", buildingsRes);
        console.log("Items response:", itemsRes);

        // Verificar se todas as responses estão OK
        if (!suppliersRes.ok) {
          const errorText = await suppliersRes.text();
          console.error("Suppliers error:", errorText);
          throw new Error(
            `Erro ao buscar fornecedores: ${suppliersRes.status} - ${errorText}`
          );
        }
        if (!installersRes.ok) {
          const errorText = await installersRes.text();
          console.error("Installers error:", errorText);
          throw new Error(
            `Erro ao buscar instaladores: ${installersRes.status} - ${errorText}`
          );
        }
        if (!buildingsRes.ok) {
          const errorText = await buildingsRes.text();
          console.error("Buildings error:", errorText);
          throw new Error(
            `Erro ao buscar prédios: ${buildingsRes.status} - ${errorText}`
          );
        }
        if (!itemsRes.ok) {
          const errorText = await itemsRes.text();
          console.error("Items error:", errorText);
          throw new Error(
            `Erro ao buscar itens: ${itemsRes.status} - ${errorText}`
          );
        }

        // Parsear JSON de cada response com tratamento de erro
        const [suppliersData, installersData, buildingsData, itemsData] =
          await Promise.all([
            suppliersRes.json().catch(async (err) => {
              console.error("Erro ao parsear suppliers JSON:", err);
              const text = await suppliersRes.text();
              console.log("Suppliers response text:", text);
              return { data: [], aiSuggestion: "" };
            }),
            installersRes.json().catch(async (err) => {
              console.error("Erro ao parsear installers JSON:", err);
              const text = await installersRes.text();
              console.log("Installers response text:", text);
              return { data: [], aiSuggestion: "" };
            }),
            buildingsRes.json().catch(async (err) => {
              console.error("Erro ao parsear buildings JSON:", err);
              const text = await buildingsRes.text();
              console.log("Buildings response text:", text);
              return { data: [], aiSuggestion: "" };
            }),
            itemsRes.json().catch(async (err) => {
              console.error("Erro ao parsear items JSON:", err);
              const text = await itemsRes.text();
              console.log("Items response text:", text);
              return { data: [], aiSuggestion: "" };
            }),
          ]);

        setData({
          suppliers: suppliersData.data || [],
          installers: installersData.data || [],
          buildings: buildingsData.data || [],
          items: itemsData.data || [],
          aiSuggestions: {
            suppliers: validateSuggestion(suppliersData.aiSuggestion),
            installers: validateSuggestion(installersData.aiSuggestion),
            buildings: validateSuggestion(buildingsData.aiSuggestion),
            items: validateSuggestion(itemsData.aiSuggestion),
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    if (developmentId) {
      fetchAnalytics();
    }
  }, [developmentId]);

  return { data, loading, error };
}
