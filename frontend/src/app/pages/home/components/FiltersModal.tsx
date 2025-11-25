import { STATUS_OPTIONS } from "../utils/constants";
import type { Filters, Option, ItemOption } from "../utils/types";

interface FiltersModalProps {
  isOpen: boolean;
  draftFilters: Filters;
  itemOptions: ItemOption[];
  supplierOptions: Option[];
  installerOptions: Option[];
  loadingOptions: {
    items: boolean;
    suppliers: boolean;
    installers: boolean;
  };
  error: string | null;
  onClose: () => void;
  onUpdateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onToggleStatus: (status: string) => void;
  onReset: () => void;
  onApply: () => void;
}

export function FiltersModal({
  isOpen,
  draftFilters,
  itemOptions,
  supplierOptions,
  installerOptions,
  loadingOptions,
  error,
  onClose,
  onUpdateFilter,
  onToggleStatus,
  onReset,
  onApply,
}: FiltersModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[80]"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[720px] max-h-[90vh] flex flex-col bg-gradient-to-b from-[#171a2b] to-[#10142a] border border-slate-700 rounded-2xl shadow-xl">
        <div className="px-5 py-5 flex items-center justify-between border-b border-slate-700">
          <h3 className="text-lg font-semibold m-0">Filtros avançados</h3>
          <button
            className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-900 grid place-items-center cursor-pointer hover:bg-slate-800 transition-colors"
            type="button"
            onClick={onClose}
            aria-label="Fechar filtros"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-5 overflow-y-auto flex flex-col gap-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-xs">Data inicial</label>
              <input
                className="h-9 px-3 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors w-full"
                type="date"
                value={draftFilters.startDate}
                onChange={(event) =>
                  onUpdateFilter("startDate", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-xs">Data final</label>
              <input
                className="h-9 px-3 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors w-full"
                type="date"
                value={draftFilters.endDate}
                onChange={(event) =>
                  onUpdateFilter("endDate", event.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-xs">
                Item instalado
              </label>
              <select
                className="h-9 px-3 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors w-full"
                value={draftFilters.itemId}
                onChange={(event) => onUpdateFilter("itemId", event.target.value)}
                disabled={loadingOptions.items}
              >
                <option value="">Todos</option>
                {itemOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
              {itemOptions.length === 0 && !loadingOptions.items && (
                <span className="text-slate-500 text-xs">
                  Nenhum item encontrado.
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-xs">Fornecedor</label>
              <select
                className="h-9 px-3 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors w-full"
                value={draftFilters.supplierId}
                onChange={(event) =>
                  onUpdateFilter("supplierId", event.target.value)
                }
                disabled={loadingOptions.suppliers}
              >
                <option value="">Todos</option>
                {supplierOptions.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-xs">Instalador</label>
              <select
                className="h-9 px-3 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors w-full"
                value={draftFilters.installerId}
                onChange={(event) =>
                  onUpdateFilter("installerId", event.target.value)
                }
                disabled={loadingOptions.installers}
              >
                <option value="">Todos</option>
                {installerOptions.map((installer) => (
                  <option key={installer.id} value={installer.id}>
                    {installer.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-slate-500 text-xs">Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => {
                  const checked = draftFilters.statuses.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-700 bg-slate-950 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="w-[18px] h-[18px] cursor-pointer accent-indigo-500"
                        checked={checked}
                        onChange={() => onToggleStatus(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 px-3 py-2.5 rounded-lg bg-slate-950 border border-red-800 text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-5 border-t border-slate-700 flex items-center justify-end gap-2.5 flex-wrap">
          <button
            type="button"
            className="h-9 px-3.5 rounded-lg border border-transparent bg-transparent text-slate-500 hover:text-slate-100 hover:border-slate-700 transition-colors"
            onClick={onReset}
          >
            Limpar
          </button>
          <div className="flex-1" />
          <button
            type="button"
            className="h-9 px-3.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 cursor-pointer hover:brightness-110 transition-all"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="h-9 px-3.5 rounded-lg border border-indigo-600 bg-gradient-to-b from-indigo-500 to-indigo-600 text-slate-950 font-bold cursor-pointer hover:brightness-110 transition-all"
            onClick={onApply}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

