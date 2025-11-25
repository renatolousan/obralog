import { useState } from "react";

export type VisitFormData = {
  date: string;
  time: string;
  duration: string;
  foremen_id: string[];
  repairCost: string;
  id_installer: string;
};

const initialFormData: VisitFormData = {
  date: "",
  time: "",
  duration: "60",
  foremen_id: [],
  repairCost: "",
  id_installer: "",
};

export const useVisitForm = () => {
  const [formData, setFormData] = useState<VisitFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFormData(initialFormData);
    setError(null);
  };

  const updateField = <K extends keyof VisitFormData>(
    field: K,
    value: VisitFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleForeman = (foremanId: string) => {
    setFormData((prev) => {
      const isSelected = prev.foremen_id.includes(foremanId);
      return {
        ...prev,
        foremen_id: isSelected
          ? prev.foremen_id.filter((id) => id !== foremanId)
          : [...prev.foremen_id, foremanId],
      };
    });
  };

  const validate = (): { isValid: boolean; error?: string } => {
    if (!formData.date || !formData.time) {
      return { isValid: false, error: "Data e hora são obrigatórias" };
    }

    if (formData.foremen_id.length === 0) {
      return { isValid: false, error: "Selecione pelo menos um encarregado" };
    }

    if (!formData.repairCost || parseFloat(formData.repairCost) <= 0) {
      return {
        isValid: false,
        error: "Custo do reparo é obrigatório e deve ser maior que zero",
      };
    }

    if (!formData.id_installer) {
      return { isValid: false, error: "Selecione o prestador de serviço" };
    }

    return { isValid: true };
  };

  return {
    formData,
    error,
    setError,
    reset,
    updateField,
    toggleForeman,
    validate,
  };
};

