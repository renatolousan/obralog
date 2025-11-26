import { toUtcMinusFourIsoLocal } from "../utils/formatters";

export function PageHeader() {
  const dataHora = toUtcMinusFourIsoLocal();

  return (
    <header className="flex flex-wrap gap-4 items-start justify-between border-b border-dashed border-white/10 pb-4 mb-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold m-0 text-white">
          Nova reclamação
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mt-1 mb-0">
          Preencha os dados para registrar a ocorrência
        </p>
      </div>
      <div className="flex flex-col gap-1 items-end w-full sm:w-auto">
        <label className="text-slate-300 text-xs">Data/Hora</label>
        <input
          className="h-10 px-3 rounded-lg border border-white/20 bg-slate-900/50 text-slate-100 outline-none w-full sm:w-auto min-w-[200px]"
          type="datetime-local"
          value={dataHora}
          readOnly
        />
      </div>
    </header>
  );
}