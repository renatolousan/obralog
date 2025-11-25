import { ReclamacaoDetails } from "./ReclamacaoDetails";
import { VisitForm } from "./VisitForm";
import type { Reclamacao } from "../utils/types";
import type { VisitFormData } from "../hooks/useVisitForm";
import type { InstallerOption } from "../utils/types";

interface ReclamacaoModalProps {
  reclamacao: Reclamacao;
  isOpen: boolean;
  showVisitForm: boolean;
  visitFormData: VisitFormData;
  installers: InstallerOption[];
  loadingInstallers: boolean;
  visitFormError: string | null;
  updatingStatus: boolean;
  onClose: () => void;
  onImageClick: (imagePath: string) => void;
  onPutInAnalysis: () => void;
  onOpenVisitForm: () => void;
  onCloseVisitForm: () => void;
  onVisitFormFieldChange: <K extends keyof VisitFormData>(
    field: K,
    value: VisitFormData[K]
  ) => void;
  onToggleForeman: (foremanId: string) => void;
  onScheduleVisit: () => void;
}

export function ReclamacaoModal({
  reclamacao,
  isOpen,
  showVisitForm,
  visitFormData,
  installers,
  loadingInstallers,
  visitFormError,
  updatingStatus,
  onClose,
  onImageClick,
  onPutInAnalysis,
  onOpenVisitForm,
  onCloseVisitForm,
  onVisitFormFieldChange,
  onToggleForeman,
  onScheduleVisit,
}: ReclamacaoModalProps) {
  if (!isOpen) return null;

  const statusCode = reclamacao.status.toUpperCase().trim();

  const renderModalActions = () => {
    if (statusCode === "ABERTO") {
      return (
        <button
          className="btn primary"
          onClick={onPutInAnalysis}
          disabled={updatingStatus}
        >
          {updatingStatus ? "Atualizando..." : "Colocar em Análise"}
        </button>
      );
    }

    if (statusCode === "EM_ANALISE") {
      return (
        <>
          {!showVisitForm ? (
            <button className="btn primary" onClick={onOpenVisitForm}>
              Agendar Visita
            </button>
          ) : (
            <VisitForm
              formData={visitFormData}
              installers={installers}
              loadingInstallers={loadingInstallers}
              error={visitFormError}
              updatingStatus={updatingStatus}
              onFieldChange={onVisitFormFieldChange}
              onToggleForeman={onToggleForeman}
              onSubmit={onScheduleVisit}
              onCancel={onCloseVisitForm}
            />
          )}
        </>
      );
    }

    if (statusCode === "AGUARDANDO_FEEDBACK") {
      return null;
    }

    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Detalhes da Reclamação</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <ReclamacaoDetails
          reclamacao={reclamacao}
          onImageClick={onImageClick}
        />

        <div className="modal-footer">
          {renderModalActions()}
          <button className="btn secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

