import type { Atividade } from "../utils/types";
import { getStatusLabel, getStatusVariant, getStatusColors } from "../utils/formatters";

interface ActivitiesTableProps {
  activities: Atividade[];
  loading: boolean;
  total: number;
  onRowClick: (activity: Atividade) => void;
}

export function ActivitiesTable({
  activities,
  loading,
  total,
  onRowClick,
}: ActivitiesTableProps) {
  return (
    <section className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-dashed border-slate-700">
        <h1 className="text-lg font-semibold m-0">Últimas reclamações</h1>
        <span className="text-xs text-slate-500">
          {loading ? "Carregando…" : `${total} resultado(s)`}
        </span>
      </div>

      <div className="overflow-auto px-3 py-3">
        <table className="w-full border-collapse border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="text-left px-3 py-3 text-slate-500 sticky top-0 bg-slate-900 backdrop-blur-sm border-b border-slate-700 z-10">
                Data/Hora
              </th>
              <th className="text-left px-3 py-3 text-slate-500 sticky top-0 bg-slate-900 backdrop-blur-sm border-b border-slate-700 z-10">
                Descrição
              </th>
              <th className="text-left px-3 py-3 text-slate-500 sticky top-0 bg-slate-900 backdrop-blur-sm border-b border-slate-700 z-10">
                Issue
              </th>
              <th className="text-left px-3 py-3 text-slate-500 sticky top-0 bg-slate-900 backdrop-blur-sm border-b border-slate-700 z-10">
                ID Item
              </th>
              <th className="text-left px-3 py-3 text-slate-500 sticky top-0 bg-slate-900 backdrop-blur-sm border-b border-slate-700 z-10">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-slate-500 px-3 py-3 text-center"
                >
                  Carregando reclamações…
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-slate-500 px-3 py-3 text-center"
                >
                  Nenhuma reclamação encontrada.
                </td>
              </tr>
            ) : (
              activities.map((activity, idx) => {
                const statusCode =
                  activity.status_codigo || activity.status;
                const statusVariant = getStatusVariant(statusCode);
                const statusLabel = getStatusLabel(statusCode);
                const itemId = activity.item?.id ?? activity.id_item;
                const statusColorClass = getStatusColors(statusVariant);

                return (
                  <tr
                    key={activity.id}
                    className={`cursor-pointer transition-all hover:bg-indigo-500/10 hover:-translate-y-px hover:shadow-md ${
                      idx % 2 === 0
                        ? "bg-slate-900/50"
                        : "bg-slate-800/50"
                    }`}
                    onClick={() => onRowClick(activity)}
                  >
                    <td className="whitespace-nowrap tabular-nums text-slate-300 px-3 py-2.5 border-b border-dashed border-slate-700/50">
                      {activity.data_hora}
                    </td>
                    <td
                      className="max-w-[520px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2.5 border-b border-dashed border-slate-700/50"
                      title={activity.descricao}
                    >
                      {activity.descricao.length > 80
                        ? `${activity.descricao.slice(0, 80)}...`
                        : activity.descricao}
                    </td>
                    <td className="w-[1%] whitespace-nowrap px-3 py-2.5 border-b border-dashed border-slate-700/50">
                      <button
                        type="button"
                        className="border-none bg-transparent text-indigo-400 font-semibold cursor-pointer underline p-0 hover:text-indigo-300 transition-colors"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRowClick(activity);
                        }}
                      >
                        {activity.issue}
                      </button>
                    </td>
                    <td className="text-center text-slate-300 px-3 py-2.5 border-b border-dashed border-slate-700/50">
                      {itemId}
                    </td>
                    <td className="px-3 py-2.5 border-b border-dashed border-slate-700/50">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border capitalize font-medium text-xs ${statusColorClass}`}
                        data-status-code={statusCode}
                      >
                        <span className="w-2 h-2 rounded-full bg-current opacity-85 shadow-[0_0_0_2px_rgba(0,0,0,0.25)]" />
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

