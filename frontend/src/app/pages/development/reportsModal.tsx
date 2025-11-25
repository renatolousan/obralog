"use client";

import { ReportItem } from "./ReportItem";
import { availableReports } from "./reports";

type Props = {
  open: boolean;
  onClose: () => void;
  developmentId?: string | number;
};

export function ReportsModal({ open, onClose, developmentId }: Props) {
  if (!open) return null;
  const filteredReports = availableReports.filter((report) => {
    if (developmentId === undefined) {
      // Modal geral - mostra apenas relatórios gerais
      return report.isGeneral === true;
    } else {
      // Modal específico - mostra apenas relatórios específicos de obra
      return report.isGeneral === false;
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reports-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <header className="flex-shrink-0 flex items-start justify-between p-5 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2
            id="reports-title"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            Relatórios de obras
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Fechar"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
              Nenhum relatório disponível
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report, index) => (
                <ReportItem
                  key={index}
                  title={report.title}
                  endpoint={report.endpoint}
                  developmentId={developmentId}
                  haveInterval={report.haveInterval}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center justify-end gap-2 p-5 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
