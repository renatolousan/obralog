"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buildBackendUrl } from "@/lib/api";
import { useActivities } from "./hooks/useActivities";
import { useOptions } from "./hooks/useOptions";
import { useFilters } from "./hooks/useFilters";
import { useFeedbackForm } from "./hooks/useFeedbackForm";
import { useActivityActions } from "./hooks/useActivityActions";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { SearchBar } from "./components/SearchBar";
import { ActiveFilters } from "./components/ActiveFilters";
import { ActivitiesTable } from "./components/ActivitiesTable";
import { FiltersModal } from "./components/FiltersModal";
import { ActivityModal } from "./components/ActivityModal";
import { ImageModal } from "./components/ImageModal";
import type { Atividade } from "./utils/types";

export default function HomePage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Atividade | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const {
    filters,
    draftFilters,
    filtersOpen,
    filterError,
    hasActiveFilters,
    setFilterError,
    openFilters,
    closeFilters,
    applyFilters,
    resetDraftFilters,
    clearAllFilters,
    updateDraftFilter,
    toggleStatus,
  } = useFilters();

  const {
    itemOptions,
    supplierOptions,
    installerOptions,
    loadingOptions,
    loadUserItems,
    loadSuppliers,
    loadInstallers,
  } = useOptions();

  const { activities, loading, error, total, reload } = useActivities(
    filters,
    appliedSearch
  );

  const {
    formData: feedbackForm,
    error: feedbackError,
    setError: setFeedbackError,
    updateField: updateFeedbackField,
    reset: resetFeedbackForm,
  } = useFeedbackForm();

  const { updatingStatus, confirmVisit, submitFeedback } = useActivityActions(
    () => {
      reload();
      closeModal();
    }
  );

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedSearch(searchTerm.trim());
  };

  const clearSearch = () => {
    setSearchTerm("");
    setAppliedSearch("");
  };

  const handleOpenFilters = () => {
    openFilters();
    if (!itemOptions.length) {
      loadUserItems().catch((err) => {
        setFilterError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os itens"
        );
      });
    }
    if (!supplierOptions.length) {
      loadSuppliers().catch((err) => {
        setFilterError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar fornecedores"
        );
      });
    }
    if (!installerOptions.length) {
      loadInstallers().catch((err) => {
        setFilterError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar instaladores"
        );
      });
    }
  };

  const handleRowClick = (activity: Atividade) => {
    setSelectedActivity(activity);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedActivity(null);
    resetFeedbackForm();
  };

  const openImageModal = useCallback((imagePath: string) => {
    setSelectedImage(buildBackendUrl(imagePath));
    setImageModalOpen(true);
  }, []);

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleConfirmVisit = useCallback(async () => {
    if (!selectedActivity) return;
    try {
      await confirmVisit(selectedActivity.id);
    } catch (err: unknown) {
      console.log(err);
    }
  }, [selectedActivity, confirmVisit]);

  const handleSubmitFeedback = useCallback(async () => {
    if (!selectedActivity) return;
    try {
      await submitFeedback(selectedActivity.id, feedbackForm);
      resetFeedbackForm();
    } catch (err) {
      // Error já é tratado no hook
      setFeedbackError(
        err instanceof Error ? err.message : "Erro ao enviar feedback"
      );
    }
  }, [
    selectedActivity,
    feedbackForm,
    submitFeedback,
    resetFeedbackForm,
    setFeedbackError,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3739a2] to-[#1a1b4b] text-slate-100">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div
        className={`grid gap-4 p-4 transition-all ${
          sidebarOpen ? "lg:grid-cols-[260px_1fr]" : "lg:grid-cols-[0_1fr]"
        } grid-cols-1`}
      >
        <Sidebar isOpen={sidebarOpen} />

        <main className="bg-gradient-to-b from-[#171a2b] to-[#121326] border border-slate-700 rounded-2xl p-4 shadow-xl min-h-[calc(100vh-96px)] grid grid-rows-[auto_auto_1fr] gap-4">
          <header className="flex flex-wrap gap-2.5 items-center justify-between border-b border-dashed border-slate-700 pb-2.5">
            <h2 className="text-lg sm:text-xl font-semibold m-0">
              Visão Geral
            </h2>
            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
              <SearchBar
                searchTerm={searchTerm}
                appliedSearch={appliedSearch}
                onSearchChange={setSearchTerm}
                onSearchSubmit={handleSearchSubmit}
                onClearSearch={clearSearch}
              />
              <button
                className="h-9 px-3.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 cursor-pointer hover:brightness-110 transition-all"
                type="button"
                onClick={handleOpenFilters}
              >
                Filtrar
              </button>
              <button
                onClick={() => router.push("/pages/reclamation")}
                className="h-9 px-3.5 rounded-lg border border-indigo-600 bg-gradient-to-b from-indigo-500 to-indigo-600 text-slate-950 font-bold cursor-pointer hover:brightness-110 transition-all"
                type="button"
              >
                Nova reclamação
              </button>
            </div>
          </header>

          <ActiveFilters
            hasActiveFilters={hasActiveFilters}
            appliedSearch={appliedSearch}
            onClearSearch={clearSearch}
            onClearAllFilters={clearAllFilters}
          />

          <ActivitiesTable
            activities={activities}
            loading={loading}
            total={total}
            onRowClick={handleRowClick}
          />

          {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        </main>
      </div>

      <FiltersModal
        isOpen={filtersOpen}
        draftFilters={draftFilters}
        itemOptions={itemOptions}
        supplierOptions={supplierOptions}
        installerOptions={installerOptions}
        loadingOptions={loadingOptions}
        error={filterError}
        onClose={closeFilters}
        onUpdateFilter={updateDraftFilter}
        onToggleStatus={toggleStatus}
        onReset={resetDraftFilters}
        onApply={applyFilters}
      />

      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          isOpen={modalOpen}
          feedbackForm={feedbackForm}
          feedbackError={feedbackError}
          updatingStatus={updatingStatus}
          onClose={closeModal}
          onImageClick={openImageModal}
          onConfirmVisit={handleConfirmVisit}
          onFeedbackFieldChange={updateFeedbackField}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}

      <ImageModal
        isOpen={imageModalOpen}
        imageUrl={selectedImage}
        onClose={closeImageModal}
      />
    </div>
  );
}
