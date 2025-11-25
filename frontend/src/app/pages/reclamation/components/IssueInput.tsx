interface IssueInputProps {
  value: string;
  error?: string;
  suggesting: boolean;
  canSuggest: boolean;
  onChange: (value: string) => void;
  onSuggest: () => void;
}

export function IssueInput({
  value,
  error,
  suggesting,
  canSuggest,
  onChange,
  onSuggest,
}: IssueInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-500 text-xs">Tipo de problema</label>
      <div className="flex gap-2 items-start">
        <input
          className={`h-10 px-3 rounded-lg border bg-slate-950 text-slate-100 outline-none transition-colors flex-1 ${
            error
              ? "border-red-800 shadow-[0_0_0_2px_rgba(255,94,94,0.12)]"
              : "border-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          }`}
          type="text"
          placeholder="ex.: Instalação"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="h-10 px-3.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 cursor-pointer hover:brightness-110 transition-all whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onSuggest}
          disabled={!canSuggest || suggesting}
          title="Sugerir categoria baseada na descrição"
        >
          {suggesting ? "..." : "🤖 IA"}
        </button>
      </div>
      {error && <small className="text-red-300 text-xs">{error}</small>}
    </div>
  );
}

