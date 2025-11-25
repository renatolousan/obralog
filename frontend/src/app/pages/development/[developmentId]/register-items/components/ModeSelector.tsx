import type { RegisterMode } from "../utils/types";

interface ModeSelectorProps {
  mode: RegisterMode;
  onModeChange: (mode: RegisterMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="mb-6 flex gap-4 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => onModeChange("individual")}
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          mode === "individual"
            ? "bg-indigo-600 text-white"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        }`}
      >
        Cadastro individual
      </button>
      <button
        type="button"
        onClick={() => onModeChange("file")}
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          mode === "file"
            ? "bg-indigo-600 text-white"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        }`}
      >
        Importar Arquivo
      </button>
    </div>
  );
}

