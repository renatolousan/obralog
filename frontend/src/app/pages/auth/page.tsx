"use client";

import { useState } from "react";
import { useAuthForm } from "./hooks/useAuthForm";
import { AuthNavbar } from "./components/AuthNavbar";
import { WelcomeSection } from "./components/WelcomeSection";
import { AuthForm } from "./components/AuthForm";
import type { Mode } from "./utils/schemas";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");

  const {
    form,
    onSubmit,
    apiError,
    successMessage,
    clearMessages,
    cpfValue,
    phoneValue,
    setValue,
  } = useAuthForm(mode);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    form.reset();
    clearMessages();
  };

  const handleReset = () => {
    form.reset();
    clearMessages();
  };

  return (
    <div className="min-h-screen bg-white">
      <AuthNavbar
        mode={mode}
        onModeChange={handleModeChange}
        onReset={handleReset}
      />

      <div className="min-h-screen flex flex-col lg:flex-row">
        <WelcomeSection />
        <AuthForm
          mode={mode}
          form={form}
          onSubmit={onSubmit}
          apiError={apiError}
          successMessage={successMessage}
          cpfValue={cpfValue}
          phoneValue={phoneValue}
          setValue={setValue}
        />
      </div>
    </div>
  );
}
