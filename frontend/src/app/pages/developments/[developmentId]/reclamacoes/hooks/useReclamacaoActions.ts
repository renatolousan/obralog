import { useState, useCallback } from "react";
import { buildApiUrl } from "@/lib/api";
import type { Reclamacao } from "../utils/types";
import type { VisitFormData } from "./useVisitForm";

export const useReclamacaoActions = (
  onSuccess?: () => void | Promise<void>
) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const putInAnalysis = useCallback(
    async (reclamacaoId: string) => {
      try {
        setUpdatingStatus(true);
        setError(null);

        const url = buildApiUrl(`/api/complaints/${reclamacaoId}`);
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            statusFlag: "EM_ANALISE",
          }),
        });

        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        if (!response.ok) {
          throw new Error(payload?.message ?? `Erro ${response.status}`);
        }

        if (onSuccess) {
          await onSuccess();
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao atualizar status da reclamação"
        );
        throw err;
      } finally {
        setUpdatingStatus(false);
      }
    },
    [onSuccess]
  );

  const scheduleVisit = useCallback(
    async (reclamacaoId: string, formData: VisitFormData) => {
      try {
        setUpdatingStatus(true);
        setError(null);

        // Combinar data e hora
        const dateTime = new Date(`${formData.date}T${formData.time}`);
        const duration = parseInt(formData.duration, 10);

        const url = buildApiUrl(`/api/complaints/${reclamacaoId}`);
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            statusFlag: "VISITA_AGENDADA",
            data: {
              date: dateTime.toISOString(),
              duration,
              foremen_id: formData.foremen_id,
              repairCost: parseFloat(formData.repairCost),
              id_installer: formData.id_installer,
            },
          }),
        });

        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        if (!response.ok) {
          throw new Error(payload?.message ?? `Erro ${response.status}`);
        }

        if (onSuccess) {
          await onSuccess();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao agendar visita"
        );
        throw err;
      } finally {
        setUpdatingStatus(false);
      }
    },
    [onSuccess]
  );

  return {
    updatingStatus,
    error,
    putInAnalysis,
    scheduleVisit,
  };
};

