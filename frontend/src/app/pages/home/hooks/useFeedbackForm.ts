import { useState } from "react";

export type FeedbackFormData = {
  liked: boolean;
  comment: string;
};

export const useFeedbackForm = () => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    liked: true,
    comment: "",
  });
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof FeedbackFormData>(
    field: K,
    value: FeedbackFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const reset = () => {
    setFormData({
      liked: true,
      comment: "",
    });
    setError(null);
  };

  return {
    formData,
    error,
    setError,
    updateField,
    reset,
  };
};

