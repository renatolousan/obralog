import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import type { Mode, FormData } from "../utils/schemas";
import { SignupForm } from "./SignupForm";
import { LoginForm } from "./LoginForm";

interface AuthFormProps {
  mode: Mode;
  form: UseFormReturn<FormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  apiError: string | null;
  successMessage: string | null;
  cpfValue?: string;
  phoneValue?: string;
  setValue: (name: keyof FormData, value: string, options?: { shouldValidate?: boolean }) => void;
}

export function AuthForm({
  mode,
  form,
  onSubmit,
  apiError,
  successMessage,
  cpfValue,
  phoneValue,
  setValue,
}: AuthFormProps) {
  const { formState: { errors, isSubmitting }, reset } = form;

  const title = useMemo(
    () => (mode === "signup" ? "Cadastro" : "Login"),
    [mode]
  );

  return (
    <section className="w-full lg:w-1/4 flex items-center justify-center p-4 sm:p-6 min-h-[60vh] lg:min-h-screen bg-[#1f244d]">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md mx-auto p-6 sm:p-8 md:p-10 rounded-2xl flex flex-col gap-4 bg-[#0f1326] text-slate-200 shadow-2xl"
        noValidate
      >
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">{title}</h2>

        {mode === "signup" ? (
          <SignupForm
            form={form}
            cpfValue={cpfValue}
            phoneValue={phoneValue}
            setValue={setValue}
          />
        ) : (
          <LoginForm form={form} />
        )}

        {apiError && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-900/50">
            <p className="text-red-200 text-xs sm:text-sm">{apiError}</p>
          </div>
        )}
        {successMessage && (
          <div className="p-3 rounded-lg bg-green-950/50 border border-green-900/50">
            <p className="text-green-200 text-xs sm:text-sm">
              {successMessage}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <button
            type="submit"
            className="flex-1 h-10 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : title}
          </button>
          <button
            type="button"
            className="flex-1 sm:flex-initial h-10 px-4 py-2 rounded-xl bg-transparent text-slate-200 border border-slate-700 hover:bg-slate-800/50 transition-colors"
            onClick={() => reset()}
          >
            Limpar
          </button>
        </div>
      </form>
    </section>
  );
}

