import { formatVisitDate } from "../utils/formatters";
import type { Visita } from "../utils/types";

interface VisitInfoProps {
  visita: Visita;
}

export function VisitInfo({ visita }: VisitInfoProps) {
  return (
    <div className="mt-4 p-4 sm:p-3 bg-white/3 rounded-lg border border-white/8 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/10">
        <h4 className="m-0 text-sm sm:text-base font-semibold text-slate-100 tracking-wide">
          Informações da Visita
        </h4>
      </div>
      <div className="flex flex-col gap-3.5 sm:gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Data e Hora
          </span>
          <span className="text-sm font-medium text-slate-100 pl-0 sm:pl-5">
            {formatVisitDate(visita.date)}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Duração estimada
          </span>
          <span className="text-sm font-medium text-slate-100 pl-0 sm:pl-5">
            {visita.duration} minutos
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Encarregado(s)
          </span>
          <div className="flex flex-col gap-2 pl-0 sm:pl-5">
            {visita.foremen.map((f) => (
              <div
                key={f.id}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 py-2 bg-white/4 rounded-md border border-white/6 hover:bg-white/6 hover:border-white/10 transition-all"
              >
                <span className="text-sm font-medium text-slate-100">
                  {f.name}
                </span>
                <span className="text-xs text-slate-500 font-mono px-1.5 py-0.5 bg-white/5 rounded">
                  {f.phone}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

