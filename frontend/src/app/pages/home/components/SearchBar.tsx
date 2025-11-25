interface SearchBarProps {
  searchTerm: string;
  appliedSearch: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClearSearch: () => void;
}

export function SearchBar({
  searchTerm,
  appliedSearch,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}: SearchBarProps) {
  return (
    <form
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 sm:flex-initial"
      onSubmit={onSearchSubmit}
    >
      <input
        className="h-9 px-3 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors w-full sm:w-[220px]"
        placeholder="Buscar…"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <button
        className="h-9 px-3.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 cursor-pointer hover:brightness-110 transition-all"
        type="submit"
      >
        Buscar
      </button>
      {appliedSearch && (
        <button
          type="button"
          className="h-9 px-3.5 rounded-lg border border-transparent bg-transparent text-slate-500 hover:text-slate-100 hover:border-slate-700 transition-colors"
          onClick={onClearSearch}
        >
          Limpar
        </button>
      )}
    </form>
  );
}

