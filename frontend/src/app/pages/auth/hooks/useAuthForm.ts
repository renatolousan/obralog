import { useMemo, useState } from "react";
import { useForm, Resolver, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { buildBackendUrl } from "@/lib/api";
import { signupSchema, loginSchema, type Mode, type FormData } from "../utils/schemas";
import { onlyDigits } from "../utils/formatters";

const apiSignup = "/api/users/register";
const apiLogin = "/api/users/login";

export const useAuthForm = (mode: Mode) => {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resolver = useMemo(() => {
    return zodResolver(
      mode === "signup" ? signupSchema : loginSchema
    ) as unknown as Resolver<FormData>;
  }, [mode]);

  const form = useForm<FormData>({
    resolver,
    mode: "onBlur",
    defaultValues:
      mode === "signup"
        ? { fullName: "", cpf: "", email: "", phone: "" }
        : { email: "", password: "" },
  });

  const { handleSubmit, reset, setValue, watch } = form;
  const cpfValue = watch("cpf");
  const phoneValue = watch("phone");

  const clearMessages = () => {
    setApiError(null);
    setSuccessMessage(null);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    clearMessages();

    try {
      const url = mode === "signup" ? apiSignup : apiLogin;
      const payload =
        mode === "signup"
          ? {
              fullName: (data.fullName ?? "").trim(),
              cpf: onlyDigits(data.cpf ?? ""),
              email: (data.email ?? "").trim(),
              phone: onlyDigits(data.phone ?? ""),
            }
          : {
              email: data.email.trim(),
              password: data.password,
            };

      const res = await fetch(buildBackendUrl(url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const body = (await res.json().catch(() => null)) as {
        message?: string;
        detail?: string;
        redirect?: string;
        action?: string;
        user?: { id: string; email: string };
      } | null;

      if (!body) {
        setApiError("Erro inesperado");
        return;
      }

      // DETECTA PRIMEIRO ACESSO (status 403)
      if (body.action === "FIRST_ACCESS_REQUIRED" && mode === "login") {
        setTimeout(() => {
          router.replace("/pages/changepassword?firstAccess=true");
        }, 1500);
        return;
      }

      if (!res.ok)
        throw new Error(body?.message || body?.detail || "Falha na operação");

      setSuccessMessage(
        body?.message ||
          (mode === "signup" ? "Cadastro realizado!" : "Login efetuado!")
      );

      if (mode === "login") {
        setTimeout(() => {
          router.replace(body.redirect ?? "/pages/home");
        }, 800);
      }

      reset();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro inesperado");
    }
  };

  return {
    form,
    onSubmit: handleSubmit(onSubmit),
    apiError,
    successMessage,
    clearMessages,
    cpfValue,
    phoneValue,
    setValue,
  };
};

