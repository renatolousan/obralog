import { useRouter } from "next/navigation";
import { PasswordInput } from "./PasswordInput";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { PasswordRequirements } from "./PasswordRequirements";
import { getPasswordStrength } from "../utils/passwordStrength";

interface ChangePasswordFormProps {
  isFirstAccess: boolean;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  onOldPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function ChangePasswordForm({
  isFirstAccess,
  oldPassword,
  newPassword,
  confirmPassword,
  onOldPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  loading,
}: ChangePasswordFormProps) {
  const router = useRouter();
  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const showPasswordMismatch = confirmPassword && !passwordsMatch;

  const isSubmitDisabled =
    loading ||
    !oldPassword ||
    !newPassword ||
    !confirmPassword ||
    !passwordsMatch;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <PasswordInput
        id="oldPassword"
        label={isFirstAccess ? "Senha Temporária" : "Senha Atual"}
        value={oldPassword}
        onChange={onOldPasswordChange}
        placeholder={
          isFirstAccess
            ? "Senha enviada por email"
            : "Digite a senha atual"
        }
        disabled={loading}
        className="border-slate-700 focus:border-indigo-600 focus:ring-indigo-600/20"
      />

      <div className="flex flex-col gap-2">
        <PasswordInput
          id="newPassword"
          label="Nova Senha"
          value={newPassword}
          onChange={onNewPasswordChange}
          placeholder="Mínimo 8 caracteres"
          disabled={loading}
          className="border-slate-700 focus:border-indigo-600 focus:ring-indigo-600/20"
        />

        {newPassword.length > 0 && (
          <>
            <PasswordStrengthIndicator strength={passwordStrength} />
            <p className="text-xs text-slate-400 mt-1 mb-0">
              Use letras maiúsculas, minúsculas, números e símbolos
            </p>
          </>
        )}
      </div>

      <PasswordInput
        id="confirmPassword"
        label="Confirmar Nova Senha"
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        placeholder="Digite novamente"
        disabled={loading}
        error={showPasswordMismatch ? "As senhas não coincidem" : undefined}
        className={
          showPasswordMismatch
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-700 focus:border-indigo-600 focus:ring-indigo-600/20"
        }
      />

      <PasswordRequirements password={newPassword} />

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        {!isFirstAccess && (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3.5 rounded-lg text-base font-semibold cursor-pointer transition-all border border-slate-700 bg-transparent text-slate-100 hover:bg-white/5 hover:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            ← Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex-1 px-6 py-3.5 rounded-lg text-base font-semibold cursor-pointer transition-all border-none bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-600/30 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </>
          ) : (
            "Alterar Senha"
          )}
        </button>
      </div>
    </form>
  );
}

