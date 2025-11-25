import { useState, useCallback } from "react";
import { buildApiUrl } from "@/lib/api";

export const useAISuggestion = (
  onSuggestionReceived?: (suggestion: string) => void
) => {
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestIssueFromDescription = useCallback(
    async (description: string) => {
      const descricaoTrimmed = description.trim();

      if (!descricaoTrimmed || descricaoTrimmed.length < 10) {
        setError(
          "A descrição deve ter pelo menos 10 caracteres para gerar uma sugestão"
        );
        return;
      }

      try {
        setSuggesting(true);
        setError(null);

        const response = await fetch(
          buildApiUrl("/api/ai/complaint-action"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ complaintText: descricaoTrimmed }),
            credentials: "include",
          }
        );

        const payload = (await response.json().catch(() => null)) as {
          categoria_sugerida?: string;
          acao_sugerida?: string;
          message?: string;
        } | null;

        if (!response.ok) {
          throw new Error(
            payload?.message ?? `Erro ao obter sugestão (${response.status})`
          );
        }

        if (payload?.categoria_sugerida) {
          if (onSuggestionReceived) {
            onSuggestionReceived(payload.categoria_sugerida);
          }
        } else {
          throw new Error("Resposta da API não contém categoria_sugerida");
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Erro ao obter sugestão da IA"
        );
        throw error;
      } finally {
        setSuggesting(false);
      }
    },
    [onSuggestionReceived]
  );

  return {
    suggesting,
    error,
    suggestIssueFromDescription,
    clearError: () => setError(null),
  };
};

