import { useState, useCallback } from "react";
import { buildApiUrl } from "@/lib/api";
import { onlyDigits } from "../utils/formatters";
import { initialUserForm, type UserFormData } from "../utils/types";

export const useUserForm = (onSuccess?: () => void) => {
  const [formData, setFormData] = useState<UserFormData>(initialUserForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setFormData(initialUserForm);
    setError(null);
    setSuccess(null);
  }, []);

  const validate = useCallback((): boolean => {
    if (
      !formData.name ||
      !formData.cpf ||
      !formData.email ||
      !formData.phone ||
      !formData.unitId
    ) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return false;
    }
    return true;
  }, [formData]);

  const submit = useCallback(async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!validate()) {
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        cpf: onlyDigits(formData.cpf),
        email: formData.email.trim(),
        phone: onlyDigits(formData.phone),
        unitId: formData.unitId,
        userType: "6e503925-8456-4e76-8e42-c80b0abee6fc", // client
      };

      const res = await fetch(buildApiUrl("/api/users/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro ao cadastrar usuário");
      }

      setSuccess("Usuário cadastrado com sucesso!");
      reset();

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
  }, [formData, validate, onSuccess, reset]);

  return {
    formData,
    loading,
    error,
    success,
    updateField,
    reset,
    submit,
    setError,
    setSuccess,
  };
};

