"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useBuildings } from "./hooks/useBuildings";
import { useUnits } from "./hooks/useUnits";
import { useCSVFile } from "./hooks/useCSVFile";
import { useUserForm } from "./hooks/useUserForm";
import { useMassRegister } from "./hooks/useMassRegister";
import { Navbar } from "./components/Navbar";
import { ModeSelector } from "./components/ModeSelector";
import { UserIndividualForm } from "./components/UserIndividualForm";
import { CSVUpload } from "./components/CSVUpload";
import { MessageAlert } from "./components/MessageAlert";
import type { RegisterMode } from "./utils/types";

export default function RegisterUsersPage() {
  const params = useParams();
  const developmentId = params.developmentId as string;

  const [mode, setMode] = useState<RegisterMode>("individual");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");

  const { buildings } = useBuildings(developmentId);
  const { units } = useUnits(selectedBuilding || null);

  const {
    file,
    isDragging,
    error: csvError,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
  } = useCSVFile();

  const {
    formData,
    loading: formLoading,
    error: formError,
    success: formSuccess,
    updateField,
    reset: resetForm,
    submit: submitForm,
    setError: setFormError,
    setSuccess: setFormSuccess,
  } = useUserForm(() => {
    setSelectedBuilding("");
  });

  const {
    loading: massLoading,
    error: massError,
    success: massSuccess,
    submit: submitMass,
    setError: setMassError,
    setSuccess: setMassSuccess,
  } = useMassRegister(() => {
    removeFile();
  });

  const loading = formLoading || massLoading;
  const error = formError || massError || csvError;
  const success = formSuccess || massSuccess;

  const handleModeChange = (newMode: RegisterMode) => {
    setMode(newMode);
    setFormError(null);
    setFormSuccess(null);
    setMassError(null);
    setMassSuccess(null);
  };

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuilding(buildingId);
    updateField("unitId", "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "file") {
      if (!file) {
        setMassError("Por favor, selecione um arquivo CSV.");
        return;
      }
      await submitMass(file);
    } else {
      await submitForm();
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Navbar />

        <h1 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">
          Cadastro de Moradores
        </h1>

        <ModeSelector mode={mode} onModeChange={handleModeChange} />

        <main className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <form onSubmit={handleSubmit}>
            {mode === "individual" ? (
              <UserIndividualForm
                formData={formData}
                buildings={buildings}
                units={units}
                selectedBuilding={selectedBuilding}
                onFieldChange={updateField}
                onBuildingChange={handleBuildingChange}
              />
            ) : (
              <CSVUpload
                file={file}
                isDragging={isDragging}
                onFileSelect={handleFileSelect}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onRemove={removeFile}
              />
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {loading ? "Processando..." : "Cadastrar"}
              </button>
            </div>
          </form>
        </main>

        {error && <MessageAlert message={error} type="error" />}
        {success && <MessageAlert message={success} type="success" />}
      </div>
    </div>
  );
}
