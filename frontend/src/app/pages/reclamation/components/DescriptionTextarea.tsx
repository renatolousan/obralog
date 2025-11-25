interface DescriptionTextareaProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export function DescriptionTextarea({
  value,
  error,
  onChange,
}: DescriptionTextareaProps) {
  const trimmedLength = value.trim().length;

  return (
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <label className="text-slate-500 text-xs">Descrição detalhada</label>
      <textarea
        className={`px-3 py-2.5 rounded-lg border bg-slate-950 text-slate-100 outline-none resize-none overflow-y-auto overflow-x-hidden min-h-[120px] transition-colors ${
          error
            ? "border-red-800 shadow-[0_0_0_2px_rgba(255,94,94,0.12)]"
            : "border-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
        }`}
        placeholder="Descreva o problema com o máximo de detalhes..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={8}
        maxLength={200}
      />
      <div className="text-xs text-slate-500 text-right mt-1">
        {trimmedLength}/200 caracteres
        {trimmedLength < 10 && (
          <span className="text-red-300 font-medium"> (mínimo 10)</span>
        )}
      </div>
      {error && <small className="text-red-300 text-xs">{error}</small>}
    </div>
  );
}

