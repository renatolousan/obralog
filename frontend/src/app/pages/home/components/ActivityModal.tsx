import { ActivityDetails } from "./ActivityDetails";
import { VisitInfo } from "./VisitInfo";
import { FeedbackForm } from "./FeedbackForm";
import { getStatusLabel, getStatusVariant, getStatusHighlightColors } from "../utils/formatters";
import type { Atividade } from "../utils/types";
import type { FeedbackFormData } from "../hooks/useFeedbackForm";

interface ActivityModalProps {
  activity: Atividade;
  isOpen: boolean;
  feedbackForm: FeedbackFormData;
  feedbackError: string | null;
  updatingStatus: boolean;
  onClose: () => void;
  onImageClick: (imagePath: string) => void;
  onConfirmVisit: () => void;
  onFeedbackFieldChange: <K extends keyof FeedbackFormData>(
    field: K,
    value: FeedbackFormData[K]
  ) => void;
  onSubmitFeedback: () => void;
}

export function ActivityModal({
  activity,
  isOpen,
  feedbackForm,
  feedbackError,
  updatingStatus,
  onClose,
  onImageClick,
  onConfirmVisit,
  onFeedbackFieldChange,
  onSubmitFeedback,
}: ActivityModalProps) {
  if (!isOpen) return null;

  const statusCode = activity.status_codigo || activity.status;
  const statusLabel = getStatusLabel(statusCode);
  const statusVariant = getStatusVariant(statusCode);
  const statusHighlightClass = getStatusHighlightColors(statusVariant);

  const statusColorClasses: Record<string, string> = {
    aberto: "text-orange-200",
    "em-analise": "text-blue-200",
    "visita-agendada": "text-purple-200",
    "aguardando-feedback": "text-yellow-200",
    fechado: "text-green-200",
    unknown: "text-slate-400",
  };

  const statusColorClass =
    statusColorClasses[statusVariant] || statusColorClasses["unknown"];

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-[#171a2b] border border-slate-700 rounded-2xl max-w-[600px] w-full max-h-[80vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-700">
          <h3 className="m-0 text-slate-100 text-base sm:text-lg font-semibold">
            Detalhes da Reclamação
          </h3>
          <button
            className="bg-transparent border-none text-slate-500 text-lg sm:text-xl cursor-pointer p-1 rounded transition-all w-8 h-8 flex items-center justify-center hover:bg-slate-900 hover:text-slate-100"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div
          className={`grid gap-1 mb-4 sm:mb-5 p-4 sm:p-4.5 rounded-xl border mx-4 sm:mx-6 mt-4 sm:mt-6 ${statusHighlightClass}`}
        >
          <span className="text-xs uppercase tracking-wider text-slate-500">
            Status atual
          </span>
          <span className={`text-lg sm:text-xl font-bold ${statusColorClass}`}>
            {statusLabel}
          </span>
          {statusCode === "VISITA_AGENDADA" && activity.visita && (
            <VisitInfo visita={activity.visita} />
          )}
        </div>

        <ActivityDetails activity={activity} onImageClick={onImageClick} />

        <div className="flex justify-end gap-3 px-4 sm:px-6 py-4 sm:py-5 border-t border-slate-700 bg-slate-900 rounded-b-2xl flex-col sm:flex-row">
          {statusCode === "VISITA_AGENDADA" && (
            <button
              className="h-9 px-3.5 rounded-lg border border-indigo-600 bg-gradient-to-b from-indigo-500 to-indigo-600 text-slate-950 font-bold cursor-pointer hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onConfirmVisit}
              disabled={updatingStatus}
            >
              {updatingStatus ? "Confirmando..." : "Confirmar Visita"}
            </button>
          )}

          {statusCode === "AGUARDANDO_FEEDBACK" && (
            <FeedbackForm
              formData={feedbackForm}
              error={feedbackError}
              loading={updatingStatus}
              onFieldChange={onFeedbackFieldChange}
              onSubmit={onSubmitFeedback}
            />
          )}

          {statusCode !== "VISITA_AGENDADA" &&
            statusCode !== "AGUARDANDO_FEEDBACK" && (
              <button
                className="h-9 px-3.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 cursor-pointer hover:brightness-110 transition-all"
                onClick={onClose}
              >
                Fechar
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

