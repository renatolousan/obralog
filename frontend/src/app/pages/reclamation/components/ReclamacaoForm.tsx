import { useRouter } from "next/navigation";
import { ItemSelect } from "./ItemSelect";
import { IssueInput } from "./IssueInput";
import { DescriptionTextarea } from "./DescriptionTextarea";
import { AttachmentUpload } from "./AttachmentUpload";
import { MessageAlert } from "./MessageAlert";
import type { ItemOption, AttachmentPreview } from "../utils/types";
import type { ReclamacaoForm } from "../utils/types";

interface ReclamacaoFormProps {
  values: ReclamacaoForm;
  errors: Partial<Record<keyof ReclamacaoForm, string>>;
  message: string;
  submitting: boolean;
  items: ItemOption[];
  loadingItems: boolean;
  itemsError: string | null;
  attachments: AttachmentPreview[];
  suggesting: boolean;
  aiError: string | null;
  canSuggest: boolean;
  onFieldChange: <K extends keyof ReclamacaoForm>(
    key: K,
    value: ReclamacaoForm[K]
  ) => void;
  onFileSelect: (files: File[]) => void;
  onRemoveAttachment: (id: string) => void;
  onSuggestIssue: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ReclamacaoFormComponent({
  values,
  errors,
  message,
  submitting,
  items,
  loadingItems,
  itemsError,
  attachments,
  suggesting,
  aiError,
  canSuggest,
  onFieldChange,
  onFileSelect,
  onRemoveAttachment,
  onSuggestIssue,
  onSubmit,
}: ReclamacaoFormProps) {
  const router = useRouter();

  const displayMessage = message || aiError || itemsError;

  return (
    <section className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6">
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ItemSelect
          value={values.itemId}
          items={items}
          loading={loadingItems}
          error={errors.itemId}
          onChange={(value) => onFieldChange("itemId", value)}
          disabled={loadingItems}
        />

        <IssueInput
          value={values.issue}
          error={errors.issue}
          suggesting={suggesting}
          canSuggest={canSuggest}
          onChange={(value) => onFieldChange("issue", value)}
          onSuggest={onSuggestIssue}
        />

        <DescriptionTextarea
          value={values.descricao}
          error={errors.descricao}
          onChange={(value) => onFieldChange("descricao", value)}
        />

        <AttachmentUpload
          attachments={attachments}
          onFileSelect={onFileSelect}
          onRemove={onRemoveAttachment}
        />

        {displayMessage && (
          <MessageAlert
            message={displayMessage}
            type={
              itemsError || aiError || message.includes("Erro") ? "error" : "success"
            }
          />
        )}

        <div className="sm:col-span-2 flex gap-2 justify-end mt-1">
          <button
            type="button"
            className="h-9 px-3.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 cursor-pointer hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-9 px-3.5 rounded-lg border border-indigo-600 bg-gradient-to-b from-indigo-500 to-indigo-600 text-slate-950 font-bold cursor-pointer hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </section>
  );
}

