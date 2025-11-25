import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import type { FormData } from "../utils/schemas";

interface LoginFormProps {
  form: UseFormReturn<FormData>;
}

export function LoginForm({ form }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, formState: { errors } } = form;

  return (
    <>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className="text-sm font-medium text-slate-300"
        >
          E-mail
        </label>
        <input
          id="email"
          className="h-10 px-3 rounded-lg border border-slate-700 bg-[#0f1326] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-red-400 text-xs sm:text-sm">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1 relative">
        <label
          htmlFor="password"
          className="text-sm font-medium text-slate-300"
        >
          Senha
        </label>

        <div className="relative">
          <input
            id="password"
            className="h-10 w-full px-3 pr-10 rounded-lg border border-slate-700 bg-[#0f1326] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
            tabIndex={-1}
            aria-label={
              showPassword ? "Ocultar senha" : "Mostrar senha"
            }
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>

        {errors.password && (
          <p className="text-red-400 text-xs sm:text-sm">
            {errors.password.message}
          </p>
        )}
      </div>
    </>
  );
}

