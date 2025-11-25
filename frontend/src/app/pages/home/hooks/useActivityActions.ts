import { useState, useCallback } from "react";
import { buildApiUrl } from "@/lib/api";
import type { Atividade } from "../utils/types";
import type { FeedbackFormData } from "./useFeedbackForm";

export const useActivityActions = (onSuccess?: () => void | Promise<void>) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmVisit = useCallback(
    async (activityId: string) => {
      try {
        setUpdatingStatus(true);
        setError(null);

        const url = buildApiUrl(`/api/complaints/${activityId}`);
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            statusFlag: "AGUARDANDO_FEEDBACK",
            data: {
              confirm_visit: true,
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
          err instanceof Error ? err.message : "Erro ao confirmar visita"
        );
        throw err;
      } finally {
        setUpdatingStatus(false);
      }
    },
    [onSuccess]
  );

  const submitFeedback = useCallback(
    async (activityId: string, feedbackData: FeedbackFormData) => {
      try {
        setUpdatingStatus(true);
        setError(null);

        const url = buildApiUrl(`/api/complaints/${activityId}`);
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            statusFlag: "FECHADO",
            data: {
              liked: feedbackData.liked,
              comment: feedbackData.comment.trim() || undefined,
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
        setError(err instanceof Error ? err.message : "Erro ao enviar feedback");
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
    confirmVisit,
    submitFeedback,
  };
};

