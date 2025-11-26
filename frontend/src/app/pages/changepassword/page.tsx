"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useChangePassword } from "./hooks/useChangePassword";
import { FirstAccessBanner } from "./components/FirstAccessBanner";
import { MessageAlert } from "./components/MessageAlert";
import { ChangePasswordForm } from "./components/ChangePasswordForm";
import { AnimationStyles } from "./components/Animations";

function ChangePasswordContent() {
  const searchParams = useSearchParams();
  const isFirstAccess = searchParams.get("firstAccess") === "true";

  const {
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
  } = useChangePassword();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3739a2] to-[#1a1b4b] p-4 sm:p-5">
      <AnimationStyles />
      <div className="bg-slate-900/85 border border-white/10 p-6 sm:p-10 rounded-2xl shadow-xl backdrop-blur-md w-full max-w-[500px] animate-fade-in animate-slide-down">
        {isFirstAccess && <FirstAccessBanner />}

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 m-0 mb-2 text-center">
          {isFirstAccess ? "Defina sua Senha" : "Alterar Senha"}
        </h1>

        <p className="text-sm sm:text-base text-slate-400 m-0 mb-8 text-center">
          {isFirstAccess
            ? "Crie uma senha segura para acessar o sistema"
            : "Altere sua senha de acesso"}
        </p>

        <MessageAlert type="error" message={error} />
        <MessageAlert type="success" message={success} />

        <ChangePasswordForm
          isFirstAccess={isFirstAccess}
          oldPassword={oldPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          onOldPasswordChange={setOldPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3739a2] to-[#1a1b4b] p-4 sm:p-5">
          <div className="bg-slate-900/85 border border-white/10 p-6 sm:p-10 rounded-2xl shadow-xl backdrop-blur-md w-full max-w-[500px]">
            <div className="text-center p-8">
              <p className="text-slate-100">Carregando...</p>
            </div>
          </div>
        </div>
      }
    >
      <ChangePasswordContent />
    </Suspense>
  );
}