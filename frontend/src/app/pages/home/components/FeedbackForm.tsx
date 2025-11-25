import type { FeedbackFormData } from "../hooks/useFeedbackForm";

interface FeedbackFormProps {
  formData: FeedbackFormData;
  error: string | null;
  loading: boolean;
  onFieldChange: <K extends keyof FeedbackFormData>(
    field: K,
    value: FeedbackFormData[K]
  ) => void;
  onSubmit: () => void;
}

export function FeedbackForm({
  formData,
  error,
  loading,
  onFieldChange,
  onSubmit,
}: FeedbackFormProps) {
  return (
    <div className="w-full py-4">
      <h4 className="m-0 mb-4 text-slate-100 text-base font-semibold">
        Feedback do Atendimento
      </h4>
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-slate-500 text-sm font-medium">
          Gostou do atendimento?
        </label>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 transition-all hover:bg-white/5 hover:border-indigo-500">
            <input
              type="radio"
              name="liked"
              value="true"
              className="w-[18px] h-[18px] cursor-pointer accent-indigo-500"
              checked={formData.liked === true}
              onChange={() => onFieldChange("liked", true)}
            />
            <span className="text-slate-100 text-sm">Sim</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 transition-all hover:bg-white/5 hover:border-indigo-500">
            <input
              type="radio"
              name="liked"
              value="false"
              className="w-[18px] h-[18px] cursor-pointer accent-indigo-500"
              checked={formData.liked === false}
              onChange={() => onFieldChange("liked", false)}
            />
            <span className="text-slate-100 text-sm">Não</span>
          </label>
        </div>
        <span className="text-slate-500 text-xs">
          Por favor, avalie o atendimento recebido
        </span>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <label
          htmlFor="feedback-comment"
          className="text-slate-500 text-sm font-medium"
        >
          Comentário (opcional):
        </label>
        <textarea
          id="feedback-comment"
          className="w-full min-h-[80px] px-3 py-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm outline-none resize-y focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          rows={4}
          value={formData.comment}
          onChange={(e) => onFieldChange("comment", e.target.value)}
          placeholder="Deixe seu comentário sobre o atendimento..."
        />
      </div>
      {error && (
        <div className="px-3 py-2.5 rounded-lg bg-red-950/10 border border-red-800/30 text-red-300 text-sm mb-4">
          {error}
        </div>
      )}
      <div className="flex gap-3 justify-end mt-4">
        <button
          className="h-9 px-3.5 rounded-lg border border-indigo-600 bg-gradient-to-b from-indigo-500 to-indigo-600 text-slate-950 font-bold cursor-pointer hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar Feedback"}
        </button>
      </div>
    </div>
  );
}

