"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { buildBackendUrl } from "@/app/api/_lib/backend";
import "./index.css";
import { useReclamacoes } from "./hooks/useReclamacoes";
import { useInstallers } from "./hooks/useInstallers";
import { useVisitForm } from "./hooks/useVisitForm";
import { useReclamacaoActions } from "./hooks/useReclamacaoActions";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { ReclamacoesTable } from "./components/ReclamacoesTable";
import { ReclamacaoModal } from "./components/ReclamacaoModal";
import { ImageModal } from "./components/ImageModal";
import type { Reclamacao } from "./utils/types";

export default function DevelopmentReclamacoesPage() {
  const router = useRouter();
  const params = useParams();
  const developmentId = params.developmentId as string;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedReclamacao, setSelectedReclamacao] =
    useState<Reclamacao | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showVisitForm, setShowVisitForm] = useState(false);

  const { reclamacoes, loading, error, reload } = useReclamacoes(developmentId);
  const { installers, loading: loadingInstallers, loadInstallers } =
    useInstallers();
  const {
    formData: visitFormData,
    error: visitFormError,
    setError: setVisitFormError,
    reset: resetVisitForm,
    updateField: updateVisitFormField,
    toggleForeman,
    validate: validateVisitForm,
  } = useVisitForm();

  const { updatingStatus, putInAnalysis, scheduleVisit } =
    useReclamacaoActions(() => {
      reload();
      closeModal();
    });

  const handleRowClick = (reclamacao: Reclamacao) => {
    setSelectedReclamacao(reclamacao);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedReclamacao(null);
    setShowVisitForm(false);
    resetVisitForm();
  };

  const openImageModal = useCallback((imagePath: string) => {
    setSelectedImage(buildBackendUrl(imagePath).toString());
    setImageModalOpen(true);
  }, []);

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const handlePutInAnalysis = useCallback(async () => {
    if (!selectedReclamacao) return;
    try {
      await putInAnalysis(selectedReclamacao.id);
    } catch (err) {
      // Error já é tratado no hook
    }
  }, [selectedReclamacao, putInAnalysis]);

  const handleOpenVisitForm = useCallback(() => {
    setShowVisitForm(true);
    setVisitFormError(null);
    if (installers.length === 0) {
      loadInstallers();
    }
  }, [installers.length, loadInstallers, setVisitFormError]);

  const handleScheduleVisit = useCallback(async () => {
    if (!selectedReclamacao) return;

    const validation = validateVisitForm();
    if (!validation.isValid) {
      setVisitFormError(validation.error || "Erro na validação");
      return;
    }

    try {
      setVisitFormError(null);
      await scheduleVisit(selectedReclamacao.id, visitFormData);
      resetVisitForm();
      setShowVisitForm(false);
    } catch (err) {
      // Error já é tratado no hook
    }
  }, [selectedReclamacao, visitFormData, validateVisitForm, scheduleVisit, resetVisitForm, setVisitFormError]);

  return (
    <div className="app">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className={`layout ${sidebarOpen ? "with-sidebar" : "collapsed"}`}>
        <Sidebar isOpen={sidebarOpen} />

        <main className="main">
          <header className="main-header">
            <h2>Reclamações da Obra</h2>
            <div className="actions">
              <button
                onClick={() => router.push("/pages/development")}
                className="btn"
                type="button"
              >
                Voltar
              </button>
            </div>
          </header>

          <section className="panel">
            <div className="panel-header">
              <h1>Reclamações</h1>
              <span className="table-meta">
                {loading
                  ? "Carregando…"
                  : `${reclamacoes.length} resultado(s)`}
              </span>
            </div>

            <ReclamacoesTable
              reclamacoes={reclamacoes}
              loading={loading}
              onRowClick={handleRowClick}
            />

            {error && <div className="error-message">{error}</div>}
          </section>
        </main>
      </div>

      {selectedReclamacao && (
        <ReclamacaoModal
          reclamacao={selectedReclamacao}
          isOpen={modalOpen}
          showVisitForm={showVisitForm}
          visitFormData={visitFormData}
          installers={installers}
          loadingInstallers={loadingInstallers}
          visitFormError={visitFormError}
          updatingStatus={updatingStatus}
          onClose={closeModal}
          onImageClick={openImageModal}
          onPutInAnalysis={handlePutInAnalysis}
          onOpenVisitForm={handleOpenVisitForm}
          onCloseVisitForm={() => {
            setShowVisitForm(false);
            setVisitFormError(null);
          }}
          onVisitFormFieldChange={updateVisitFormField}
          onToggleForeman={toggleForeman}
          onScheduleVisit={handleScheduleVisit}
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
