import { UseFormReturn } from "react-hook-form";
import { formatCPF, formatPhoneBR } from "../utils/formatters";
import type { FormData } from "../utils/schemas";

interface SignupFormProps {
  form: UseFormReturn<FormData>;
  cpfValue?: string;
  phoneValue?: string;
  setValue: (name: keyof FormData, value: string, options?: { shouldValidate?: boolean }) => void;
}

export function SignupForm({ form, cpfValue, phoneValue, setValue }: SignupFormProps) {
  const { register, formState: { errors } } = form;

  return (
    <>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="fullName"
          className="text-sm font-medium text-slate-300"
        >
          Nome completo
        </label>
        <input
          id="fullName"
          className="h-10 px-3 rounded-lg border border-slate-700 bg-[#0f1326] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          placeholder="Seu nome completo"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-red-400 text-xs sm:text-sm">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="cpf"
          className="text-sm font-medium text-slate-300"
        >
          CPF
        </label>
        <input
          id="cpf"
          className="h-10 px-3 rounded-lg border border-slate-700 bg-[#0f1326] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={formatCPF(cpfValue || "")}
          onChange={(e) =>
            setValue("cpf", e.target.value, { shouldValidate: true })
          }
        />
        {errors.cpf && (
          <p className="text-red-400 text-xs sm:text-sm">
            {errors.cpf.message}
          </p>
        )}
      </div>

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

      <div className="flex flex-col gap-1">
        <label
          htmlFor="phone"
          className="text-sm font-medium text-slate-300"
        >
          Telefone
        </label>
        <input
          id="phone"
          className="h-10 px-3 rounded-lg border border-slate-700 bg-[#0f1326] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          inputMode="tel"
          placeholder="(99) 99999-9999"
          value={formatPhoneBR(phoneValue || "")}
          onChange={(e) =>
            setValue("phone", e.target.value, {
              shouldValidate: true,
            })
          }
        />
        {errors.phone && (
          <p className="text-red-400 text-xs sm:text-sm">
            {errors.phone.message}
          </p>
        )}
      </div>
    </>
  );
}

