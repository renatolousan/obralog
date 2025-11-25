import { useState, useCallback } from "react";
import { buildApiUrl } from "@/lib/api";

export const useMassRegister = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = useCallback(
    async (file: File) => {
      setError(null);
      setSuccess(null);
      setLoading(true);

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("file", file);

        const res = await fetch(buildApiUrl("/api/items/mass-register"), {
          method: "POST",
          body: formDataToSend,
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || data.error || "Erro ao cadastrar itens"
          );
        }

        setSuccess(
          `Arquivo processado com sucesso! ${
            data.successCount || 0
          } item(ns) cadastrado(s).`
        );

        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao processar requisição"
        );
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  return {
    loading,
    error,
    success,
    submit,
    setError,
    setSuccess,
  };
};

