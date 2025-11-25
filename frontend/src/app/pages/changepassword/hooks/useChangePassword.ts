import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildBackendUrl } from "@/lib/api";
import { validatePasswordChange } from "../utils/validators";
import type { ChangePasswordResponse } from "../utils/types";

export const useChangePassword = () => {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const validation = validatePasswordChange(oldPassword, newPassword, confirmPassword);
    if (!validation.isValid) {
      setError(validation.error || "Erro na validação");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        buildBackendUrl("/api/users/change-password"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao alterar senha");
      }

      const data = (await response.json()) as ChangePasswordResponse;

      setSuccess(data.message || "Senha alterada com sucesso!");

      // Limpar campos
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push(data.redirect);
      }, 2000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Erro ao trocar senha");
    } finally {
      setLoading(false);
    }
  };

  return {
    oldPassword,
    newPassword,
    confirmPassword,
    error,
    success,
    loading,
    setOldPassword,
    setNewPassword,
    setConfirmPassword,
    handleSubmit,
    clearMessages,
  };
};

