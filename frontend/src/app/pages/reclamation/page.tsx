"use client";

import { useMemo } from "react";
import { useItems } from "./hooks/useItems";
import { useAttachments } from "./hooks/useAttachments";
import { useReclamacaoForm } from "./hooks/useReclamacaoForm";
import { useAISuggestion } from "./hooks/useAISuggestion";
import { Navbar } from "./components/Navbar"; 
import { PageHeader } from "./components/PageHeader";
import { ReclamacaoFormComponent } from "./components/ReclamacaoForm";

export default function ComplaintPage() {
  const { items, loading: loadingItems, error: itemsError } = useItems();
  const {
    attachments,
    addAttachments,
    removeAttachment,
    clearAll: clearAttachments,
  } = useAttachments();

  const {
    values,
    errors,
    message,
    submitting,
    setField,
    setMessage,
    submit,
    reset,
  } = useReclamacaoForm(attachments, () => {
    clearAttachments();
  });

  const canSuggest = useMemo(
    () =>
      Boolean(
        values.descricao.trim() && values.descricao.trim().length >= 10
      ) && !submitting,
    [values.descricao, submitting]
  );

  const {
    suggesting,
    error: aiError,
    suggestIssueFromDescription,
    clearError: clearAIError,
  } = useAISuggestion((suggestion) => {
    setField("issue", suggestion);
    setMessage("Categoria sugerida aplicada com sucesso!");
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearAIError();
    void submit();
  };

  const handleSuggestIssue = async () => {
    clearAIError();
    try {
      await suggestIssueFromDescription(values.descricao);
    } catch {
      // Error já é tratado no hook
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3739a2] to-[#1a1b4b] text-slate-100">
      
      <Navbar />

      <div className="grid gap-4 p-4">
        <main className="max-w-[980px] mx-auto w-full">
          <PageHeader />

          <ReclamacaoFormComponent
            values={values}
            errors={errors}
            message={message}
            submitting={submitting}
            items={items}
            loadingItems={loadingItems}
            itemsError={itemsError}
            attachments={attachments}
            suggesting={suggesting}
            aiError={aiError}
            canSuggest={canSuggest}
            onFieldChange={setField}
            onFileSelect={addAttachments}
            onRemoveAttachment={removeAttachment}
            onSuggestIssue={handleSuggestIssue}
            onSubmit={handleSubmit}
          />
        </main>
      </div>
    </div>
  );
}