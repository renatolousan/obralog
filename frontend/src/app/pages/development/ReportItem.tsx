"use client";

import { useState } from "react";
import { buildBackendUrl } from "@/lib/api";

type Props = {
  title: string;
  endpoint: string;
  developmentId?: string | number;
  haveInterval?: boolean;
};

export function ReportItem({
  title,
  endpoint,
  developmentId,
  haveInterval,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    // Validação para intervalos
    if (haveInterval) {
      if (!startMonth || !endMonth) {
        setError("Por favor, preencha ambas as datas");
        setLoading(false);
        return;
      }
      if (startMonth > endMonth) {
        setError("A data inicial deve ser anterior à data final");
        setLoading(false);
        return;
      }
    }

    try {
      let url = buildBackendUrl(endpoint);

      if (developmentId !== undefined) {
        url = url.replace(/:id/g, String(developmentId));
      } else if (url.includes(":id")) {
        setError("ID do empreendimento é necessário para este relatório");
        setLoading(false);
        return;
      }

      // Configura a requisição
      const requestOptions: RequestInit = {
        method: haveInterval ? "POST" : "GET",
        credentials: "include",
      };

      // Adiciona headers e body se tiver intervalo
      if (haveInterval) {
        requestOptions.headers = {
          "Content-Type": "application/json",
        };
        requestOptions.body = JSON.stringify({
          startMonth,
          endMonth,
        });
      }
      console.log(url);
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(
          `Erro ao baixar: ${response.status} ${response.statusText}`
        );
      }

      // Obtém o blob da resposta
      const blob = await response.blob();

      // Tenta obter o nome do arquivo do header Content-Disposition, ou usa um padrão
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = title;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      // Cria um link temporário e faz o download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao baixar o relatório";
      setError(message);
      console.error("Erro ao baixar relatório:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {title}
        </span>
      </div>

      {haveInterval && (
        <div className="mb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Data Inicial
              </label>
              <input
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-slate-300 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Data Final
              </label>
              <input
                type="month"
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-slate-300 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleDownload}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {loading ? (
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" className="opacity-25" />
              <path d="M12 3a9 9 0 019 9" className="opacity-75" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          )}
          {loading ? "Baixando..." : "Download"}
        </button>
        {error && (
          <span className="text-xs text-red-600 dark:text-red-400">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
