import { useState, useCallback } from "react";
import { buildApiUrl } from "@/lib/api";
import { initialItemForm, type ItemFormData, type Installer } from "../utils/types";

export const useItemForm = (onSuccess?: () => void) => {
  const [formData, setFormData] = useState<ItemFormData>(initialItemForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof ItemFormData>(key: K, value: ItemFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setFormData(initialItemForm);
    setError(null);
    setSuccess(null);
  }, []);

  const validate = useCallback(
    (selectedInstallers: Installer[]): boolean => {
      if (
        !formData.name ||
        !formData.unitId ||
        !formData.supplierCnpj ||
        !formData.supplierName ||
        selectedInstallers.length === 0
      ) {
        setError("Por favor, preencha todos os campos obrigatórios.");
        return false;
      }
      return true;
    },
    [formData]
  );

  const submit = useCallback(
    async (selectedInstallers: Installer[]) => {
      setError(null);
      setSuccess(null);
      setLoading(true);

      try {
        if (!validate(selectedInstallers)) {
          setLoading(false);
          return;
        }

        const payload = {
          unitId: formData.unitId,
          name: formData.name.trim(),
          description: formData.description.trim() || "",
          value: formData.value ? parseFloat(formData.value) : null,
          batch: formData.batch.trim() || null,
          warranty: formData.warranty ? parseInt(formData.warranty, 10) : null,
          supplier: {
            cnpj: formData.supplierCnpj.trim(),
            name: formData.supplierName.trim(),
          },
          installers: selectedInstallers.map((installer) => ({
            cpf: installer.cpf.trim(),
            name: installer.name.trim(),
            phone: installer.phone.trim() || "",
          })),
        };

        const res = await fetch(buildApiUrl("/api/items/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Erro ao cadastrar item");
        }

        setSuccess("Item cadastrado com sucesso!");
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
    },
    [formData, validate, onSuccess, reset]
  );

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

