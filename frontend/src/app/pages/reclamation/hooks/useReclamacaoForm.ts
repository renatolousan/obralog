import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api";
import { initialForm, type ReclamacaoForm, type AttachmentPreview } from "../utils/types";
import { validateReclamacaoForm, type ValidationErrors } from "../utils/validators";

export const useReclamacaoForm = (
  attachments: AttachmentPreview[],
  onSuccess?: () => void
) => {
  const router = useRouter();
  const [values, setValues] = useState<ReclamacaoForm>(initialForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const setField = useCallback(
    <K extends keyof ReclamacaoForm>(key: K, value: ReclamacaoForm[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    []
  );

  const validate = useCallback((): boolean => {
    const validationErrors = validateReclamacaoForm(values);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values]);

  const reset = useCallback(() => {
    setValues(initialForm);
    setErrors({});
    setMessage("");
  }, []);

  const submit = useCallback(async () => {
    setMessage("");

    if (!validate()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();

      formData.append("data_hora", new Date().toISOString());
      formData.append("descricao", values.descricao.trim());
      formData.append("issue", values.issue.trim().toUpperCase());
      formData.append("id_item", values.itemId);

      attachments.forEach((attachment, index) => {
        formData.append(`anexo_${index}`, attachment.file);
      });
      formData.append("total_anexos", String(attachments.length));

      const response = await fetch(buildApiUrl("/api/reclamation"), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          payload?.message ?? `Erro ao salvar (${response.status})`
        );
      }

      setMessage(payload?.message ?? "Reclamacao registrada com sucesso!");
      
      if (onSuccess) {
        onSuccess();
      }

      reset();

      setTimeout(() => {
        router.push("/pages/home");
      }, 1200);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Erro ao salvar reclamacao"
      );
    } finally {
      setSubmitting(false);
    }
  }, [values, attachments, validate, router, onSuccess, reset]);

  return {
    values,
    errors,
    message,
    submitting,
    setField,
    setMessage,
    submit,
    reset,
  };
};

