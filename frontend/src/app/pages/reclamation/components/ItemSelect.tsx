import type { ItemOption } from "../utils/types";

interface ItemSelectProps {
  value: string;
  items: ItemOption[];
  loading: boolean;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ItemSelect({
  value,
  items,
  loading,
  error,
  onChange,
  disabled,
}: ItemSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-500 text-xs">Item instalado</label>
      <select
        className={`h-10 px-3 rounded-lg border bg-slate-950 text-slate-100 outline-none w-full transition-colors appearance-none ${
          error
            ? "border-red-800 shadow-[0_0_0_2px_rgba(255,94,94,0.12)]"
            : "border-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
        } disabled:opacity-60 disabled:cursor-not-allowed`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || items.length === 0}
      >
        <option value="">Selecione o item</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nome}
          </option>
        ))}
      </select>
      {loading && (
        <span className="text-slate-500 text-xs">
          Carregando itens da unidade…
        </span>
      )}
      {items.length === 0 && !loading && (
        <span className="text-slate-500 text-xs">
          Nenhum item cadastrado para esta unidade.
        </span>
      )}
      {error && <small className="text-red-300 text-xs">{error}</small>}
    </div>
  );
}

