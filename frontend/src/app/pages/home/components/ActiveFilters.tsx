interface ActiveFiltersProps {
  hasActiveFilters: boolean;
  appliedSearch: string;
  onClearSearch: () => void;
  onClearAllFilters: () => void;
}

export function ActiveFilters({
  hasActiveFilters,
  appliedSearch,
  onClearSearch,
  onClearAllFilters,
}: ActiveFiltersProps) {
  if (!hasActiveFilters && !appliedSearch) return null;

  return (
    <div className="flex items-center flex-wrap gap-2 px-0.5">
      {appliedSearch && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-700 bg-slate-950/70 text-slate-100 text-xs">
          Busca: {appliedSearch}
          <button
            type="button"
            onClick={onClearSearch}
            aria-label="Limpar busca"
            className="border-none bg-transparent text-inherit cursor-pointer text-xs"
          >
            ✕
          </button>
        </span>
      )}
      {hasActiveFilters && (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-dashed border-slate-700 bg-transparent text-slate-500 text-xs hover:text-slate-100 transition-colors"
          onClick={onClearAllFilters}
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

