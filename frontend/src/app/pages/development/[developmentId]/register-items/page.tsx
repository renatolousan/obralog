"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useBuildings } from "./hooks/useBuildings";
import { useUnits } from "./hooks/useUnits";
import { useSuppliers } from "./hooks/useSuppliers";
import { useInstallers } from "./hooks/useInstallers";
import { useCSVFile } from "./hooks/useCSVFile";
import { useItemForm } from "./hooks/useItemForm";
import { useMassRegister } from "./hooks/useMassRegister";
import { Navbar } from "./components/Navbar";
import { ModeSelector } from "./components/ModeSelector";
import { ItemIndividualForm } from "./components/ItemIndividualForm";
import { CSVUpload } from "./components/CSVUpload";
import { MessageAlert } from "./components/MessageAlert";
import type { RegisterMode, Installer } from "./utils/types";

export default function RegisterItemsPage() {
  const params = useParams();
  const developmentId = params.developmentId as string;

  const [mode, setMode] = useState<RegisterMode>("individual");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedInstallers, setSelectedInstallers] = useState<Installer[]>([]);

  const { buildings } = useBuildings(developmentId);
  const { units } = useUnits(selectedBuilding || null);
  const { suppliers } = useSuppliers();
  const { installers } = useInstallers();

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
    submit: submitForm,
    setError: setFormError,
    setSuccess: setFormSuccess,
  } = useItemForm(() => {
    setSelectedBuilding("");
    setSelectedInstallers([]);
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
    setSelectedInstallers([]);
  };

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuilding(buildingId);
    updateField("unitId", "");
  };

  const handleSupplierChange = (supplier: (typeof suppliers)[0]) => {
    updateField("supplierCnpj", supplier.cnpj);
    updateField("supplierName", supplier.name);
  };

  const handleInstallerAdd = (installer: Installer) => {
    if (!selectedInstallers.some((si) => si.id === installer.id)) {
      setSelectedInstallers((prev) => [...prev, installer]);
    }
  };

  const handleInstallerRemove = (installerId: string) => {
    setSelectedInstallers((prev) => prev.filter((si) => si.id !== installerId));
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
      if (selectedInstallers.length === 0) {
        setFormError("Por favor, selecione pelo menos um instalador.");
        return;
      }
      await submitForm(selectedInstallers);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Navbar />

        <h1 className="mb-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">
          Cadastro de Itens
        </h1>

        <ModeSelector mode={mode} onModeChange={handleModeChange} />

        <main className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <form onSubmit={handleSubmit}>
            {mode === "individual" ? (
              <ItemIndividualForm
                formData={formData}
                buildings={buildings}
                units={units}
                suppliers={suppliers}
                installers={installers}
                selectedBuilding={selectedBuilding}
                selectedInstallers={selectedInstallers}
                onFieldChange={updateField}
                onBuildingChange={handleBuildingChange}
                onSupplierChange={handleSupplierChange}
                onInstallerAdd={handleInstallerAdd}
                onInstallerRemove={handleInstallerRemove}
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
