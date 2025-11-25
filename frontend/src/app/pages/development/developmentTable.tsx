"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildBackendUrl } from "@/app/api/_lib/backend";
import { Development, ApiListResponse } from "./types/developments";
import { DevelopmentDetailsModal } from "./DevelopmentdetailsModal";
import { ReportsModal } from "./reportsModal";
import { RiskAnalysisModal } from "./RiskAnalysisModal";

export async function fetchDevelopments(signal?: AbortSignal) {
  const res = await fetch(buildBackendUrl("/api/developments"), {
    method: "GET",
    cache: "no-store",
    signal,
    credentials: "include",
  });

  let payload: ApiListResponse<Development> | null = null;
  try {
    payload = (await res.json()) as ApiListResponse<Development>;
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const msg = (payload && payload.message) ?? `Erro ${res.status}`;
    throw new Error(msg);
  }

  const total = payload?.total ?? 0;
  const data = payload?.data ?? [];
  return { total, data };
}

type Props = {
  data: Development[];
  total: number;
  loading?: boolean;
  error?: string | null;
  onEdit?: (dev: Development) => void;
  onDelete?: (dev: Development) => void;
};

// Tipo para unidades
type Unit = {
  id: string;
  nome: string;
  numero: number;
  andar: number | null;
  torre: {
    id: string;
    nome: string;
  };
};

export function DevelopmentsTable({
  data,
  total,
  loading,
  error,
  onEdit,
  onDelete,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedDev, setSelectedDev] = useState<Development | null>(null);
  const [reportsDevId, setReportsDevId] = useState<string | number | null>(null);
  const [riskAnalysisDev, setRiskAnalysisDev] = useState<Development | null>(null);

  // Estados para unidades
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [unitsError, setUnitsError] = useState("");
  const [buildings, setBuildings] = useState<
    Array<{ id: string; nome: string }>
  >([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((d) =>
      [d.nome, d.descricao ?? "", d.endereco ?? "", String(d.id)].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [data, query]);

  // Buscar unidades do empreendimento
  const fetchUnits = async (developmentId: string) => {
    setLoadingUnits(true);
    setUnitsError("");
    setUnits([]);

    try {
      // Primeiro busca as torres
      const buildingsRes = await fetch(
        `/api/developments/${developmentId}/buildings`,
        { cache: "no-store" }
      );
      const buildingsData = await buildingsRes.json();

      if (!buildingsRes.ok) {
        throw new Error("Erro ao buscar torres");
      }

      const buildingsList = buildingsData.data || [];

      // Salva a lista de torres para o formulário
      setBuildings(
        buildingsList.map((b: { id: string; nome: string }) => ({
          id: b.id,
          nome: b.nome,
        }))
      );

      // Para cada torre, busca as unidades
      const allUnits: Unit[] = [];
      for (const building of buildingsList) {
        const unitsRes = await fetch(`/api/buildings/${building.id}/units`, {
          cache: "no-store",
        });
        const unitsData = await unitsRes.json();

        if (unitsRes.ok && unitsData.data) {
          const unitsWithBuilding = unitsData.data.map(
            (unit: {
              id: string;
              nome: string;
              numero: number;
              andar: number | null;
            }) => ({
              ...unit,
              torre: {
                id: building.id,
                nome: building.nome,
              },
            })
          );
          allUnits.push(...unitsWithBuilding);
        }
      }

      setUnits(allUnits);
    } catch (err) {
      setUnitsError("Erro ao carregar unidades");
      console.error(err);
    } finally {
      setLoadingUnits(false);
    }
  };

  // Abrir modal de detalhes
  const handleOpenDetails = (dev: Development) => {
    setSelectedDev(dev);
    fetchUnits(String(dev.id));
  };

  // Fechar modal de detalhes
  const handleCloseDetails = () => {
    setSelectedDev(null);
    setUnits([]);
    setUnitsError("");
    setBuildings([]);
  };

  // Navegar para dashboard
  const handleGoToDashboard = (developmentId: string | number) => {
    router.push(`/pages/dashboard?developmentId=${developmentId}`);
  };

  // Navegar para reclamações da obra
  const handleGoToReclamacoes = (developmentId: string | number) => {
    router.push(`/pages/developments/${developmentId}/reclamacoes`);
  };

  // Abrir modal de relatórios
  const handleOpenReports = (developmentId: string | number) => {
    setReportsDevId(developmentId);
  };

  // Fechar modal de relatórios
  const handleCloseReports = () => {
    setReportsDevId(null);
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "nome", label: "Nome" },
    { key: "descricao", label: "Descrição" },
    { key: "endereco", label: "Endereço" },
  ] as const;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* header da tabela */}
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {filtered.length}
          </span>{" "}
          de {total} resultados
        </div>

        <div className="relative w-full sm:w-80">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, descrição, endereço…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-slate-300 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600"
          />
        </div>
      </header>

      {/* tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              {[...columns, { key: "acoes", label: "Ações" }].map(
                (col, idx) => (
                  <th
                    key={col.key}
                    className={[
                      "sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-slate-50/70 dark:supports-[backdrop-filter]:bg-slate-900/40",
                      "px-4 py-3 font-semibold",
                      idx === 0 ? "rounded-tl-2xl" : "",
                      idx === columns.length ? "rounded-tr-2xl" : "",
                    ].join(" ")}
                  >
                    {col.label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3">
                    <div className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-72 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-60 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                  </td>
                </tr>
              ))}

            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  Nenhum resultado para{" "}
                  <span className="font-medium">“{query}”</span>.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              filtered.map((dev, i) => (
                <tr
                  key={dev.id}
                  className={[
                    "text-sm text-slate-700 dark:text-slate-200",
                    i % 2 === 0
                      ? "bg-white dark:bg-slate-900"
                      : "bg-slate-50/60 dark:bg-slate-900/60",
                    "transition hover:bg-slate-50 dark:hover:bg-slate-800/60",
                  ].join(" ")}
                >
                  <td className="px-4 py-3 align-top text-slate-500 dark:text-slate-400">
                    {dev.id}
                  </td>
                  <td className="px-4 py-3 align-top font-medium">
                    {dev.nome}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600 dark:text-slate-300">
                    {dev.descricao ? (
                      <span className="line-clamp-2 leading-relaxed">
                        {dev.descricao}
                      </span>
                    ) : (
                      <span className="italic text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600 dark:text-slate-300">
                    {dev.endereco ?? (
                      <span className="italic text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRiskAnalysisDev(dev)}
                        className="rounded-lg p-1.5 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950"
                        title="Análise de Risco com IA"
                      >
                        {/* ícone de IA/análise */}
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
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleOpenDetails(dev)}
                        className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                        title="Ver Detalhes"
                      >
                        {/* ícone de olho/info */}
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleGoToDashboard(dev.id)}
                        className="rounded-lg p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-950"
                        title="Dashboard"
                      >
                        {/* ícone de gráfico/dashboard */}
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleGoToReclamacoes(dev.id)}
                        className="rounded-lg p-1.5 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950"
                        title="Reclamações"
                      >
                        {/* ícone de feedback */}
                        <svg
                          viewBox="0 0 1024 1024"
                          className="h-5 w-5"
                          fill="currentColor"
                        >
                          <path d="M415.808 755.2L512 851.392 608.192 755.2H883.2V204.8H704V128h256v704h-320l-128 128-128-128H64V128h256v76.8H140.8v550.4h275.008zM473.6 64h76.8v448H473.6V64z m0 512h76.8v76.8H473.6V576z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleOpenReports(dev.id)}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        title="Relatórios"
                      >
                        {/* ícone de relatório */}
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </button>
                      {/* <button
                        onClick={() => onEdit?.(dev)}
                        className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
                        title="Editar"
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
                            d="M16.862 4.487l1.651 1.651a1.5 1.5 0 010 2.122l-9.193 9.192-3.304.826.826-3.305 9.193-9.192a1.5 1.5 0 012.122 0z"
                          />
                        </svg>
                      </button> */}
                      {/* <button
                        onClick={() => onDelete?.(dev)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                        title="Excluir"
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
                            d="M6 7h12m-9 4v6m6-6v6M9 4h6a1 1 0 011 1v1H8V5a1 1 0 011-1zM5 7h14l-1 13a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7z"
                          />
                        </svg>
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}

            {!!error && !loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-300"
                >
                  {error}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes */}
      {selectedDev && (
        <DevelopmentDetailsModal
          development={selectedDev}
          units={units}
          buildings={buildings}
          loadingUnits={loadingUnits}
          unitsError={unitsError}
          onClose={handleCloseDetails}
          onEdit={
            onEdit as
              | ((dev: {
                  id: number | string;
                  nome: string;
                  descricao?: string | null;
                  endereco?: string | null;
                }) => void)
              | undefined
          }
          onRefreshUnits={() => fetchUnits(String(selectedDev.id))}
        />
      )}

      {/* Modal de Relatórios */}
      <ReportsModal
        open={reportsDevId !== null}
        onClose={handleCloseReports}
        developmentId={reportsDevId ?? undefined}
      />

      {/* Modal de Análise de Risco */}
      {riskAnalysisDev && (
        <RiskAnalysisModal
          developmentId={String(riskAnalysisDev.id)}
          developmentName={riskAnalysisDev.nome}
          onClose={() => setRiskAnalysisDev(null)}
        />
      )}
    </section>
  );
}
