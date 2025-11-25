"use client";

import { useState } from "react";
import { buildApiUrl } from "@/lib/api";

type RiskLevel = "BAIXO" | "MÉDIO" | "ALTO";
type HealthStatus = "ÓTIMO" | "OK" | "RUIM";

type SupplierComplaint = {
  supplier: string;
  count: number;
};

type IssueComplaint = {
  issue: string;
  count: number;
};

type RiskAnalysis = {
  developmentId: string;
  developmentName: string;
  metrics: {
    totalItems: number;
    itemsWithComplaints: number;
    percentageWithComplaints: number;
    totalRepairCost: number;
  };
  complaintsBySupplier: SupplierComplaint[];
  complaintsByIssue: IssueComplaint[];
  healthStatus: {
    status: HealthStatus;
    color: string;
  };
  aiAnalysis?: {
    riskLevel: RiskLevel;
    summary: string;
    criticalPoints: string[];
    recommendations: string[];
    criticalSuppliers: string[];
  };
};

interface RiskAnalysisModalProps {
  developmentId: string;
  developmentName: string;
  onClose: () => void;
}

export function RiskAnalysisModal({
  developmentId,
  developmentName,
  onClose,
}: RiskAnalysisModalProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [riskThreshold, setRiskThreshold] = useState<number>(50);
  const [updatingThreshold, setUpdatingThreshold] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const handleUpdateThreshold = async () => {
    if (riskThreshold < 0 || riskThreshold > 100) {
      setError("O limiar deve estar entre 0 e 100");
      return;
    }

    setUpdatingThreshold(true);
    setError(null);

    try {
      const url = buildApiUrl(`/api/developments/${developmentId}/risk-threshold`);
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ riskThreshold }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      setShowConfig(false);
      // Re-analisar após atualizar o limiar
      if (analysis) {
        await handleAnalyze();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar limiar"
      );
    } finally {
      setUpdatingThreshold(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = buildApiUrl(`/api/ai/risk-analysis/${developmentId}`);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();
      console.log("Análise recebida:", data);
      console.log("aiAnalysis:", data.aiAnalysis);
      console.log("healthStatus:", data.healthStatus);
      console.log("complaintsBySupplier:", data.complaintsBySupplier);
      console.log("complaintsByIssue:", data.complaintsByIssue);
      
      // Verificar se a IA retornou os dados
      if (!data.aiAnalysis) {
        console.warn("ATENÇÃO: aiAnalysis está undefined ou null!");
        console.warn("Backend pode não ter processado a análise de IA corretamente");
      }
      if (!data.aiAnalysis?.summary) {
        console.warn("ATENÇÃO: aiAnalysis.summary está vazio!");
      }
      if (!data.aiAnalysis?.riskLevel) {
        console.warn("ATENÇÃO: aiAnalysis.riskLevel está vazio!");
      }
      
      setAnalysis(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao analisar risco"
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level?: RiskLevel) => {
    switch (level) {
      case "BAIXO":
        return "text-green-400";
      case "MÉDIO":
        return "text-yellow-400";
      case "ALTO":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getHealthColor = (status: HealthStatus) => {
    switch (status) {
      case "ÓTIMO":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "OK":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "RUIM":
        return "bg-red-500/20 text-red-400 border-red-500/50";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Análise de Risco com IA
            </h2>
            <p className="text-slate-400 mt-1">{developmentName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Configurar Limiar
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Painel de Configuração */}
        {showConfig && (
          <div className="border-b border-slate-700 bg-slate-800/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Configuração de Limiar de Risco
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Defina o percentual máximo aceitável de itens com reclamações. Obras que ultrapassarem este valor serão marcadas como de alto risco.
            </p>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Limiar de Risco (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={riskThreshold}
                  onChange={(e) => setRiskThreshold(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 50"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Valor entre 0 e 100. Padrão: 50%
                </p>
              </div>
              <button
                onClick={handleUpdateThreshold}
                disabled={updatingThreshold}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                {updatingThreshold ? "Salvando..." : "Salvar"}
              </button>
            </div>
            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-300">
                <strong>Classificação de Saúde:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                <li>🟢 <strong className="text-green-400">Ótimo</strong>: 0 a 30% de itens com reclamações</li>
                <li>🟡 <strong className="text-yellow-400">Ok</strong>: 30% até {riskThreshold}% (limiar configurado)</li>
                <li>🔴 <strong className="text-red-400">Ruim</strong>: Acima de {riskThreshold}%</li>
              </ul>
              <p className="mt-2 text-xs text-slate-500">
                * A classificação de risco da IA (BAIXO/MÉDIO/ALTO) é feita independentemente e considera também custos e fornecedores críticos.
              </p>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {!analysis ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg
                  className="w-20 h-20 mx-auto text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Iniciar Análise de Risco
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                A IA analisará todas as reclamações, custos e métricas para
                fornecer insights sobre o risco deste empreendimento.
              </p>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analisando...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Analisar com IA
                  </>
                )}
              </button>
              {error && (
                <p className="mt-4 text-red-400 text-sm">{error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status de Saúde */}
              {analysis.healthStatus && (
                <div
                  className={`p-4 rounded-lg border ${getHealthColor(
                    analysis.healthStatus.status
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Status de Saúde</p>
                      <p className="text-2xl font-bold">
                        {analysis.healthStatus.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">
                        {analysis.metrics.percentageWithComplaints.toFixed(1)}%
                      </p>
                      <p className="text-sm opacity-80">itens com problemas</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Métricas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">Total de Itens</p>
                  <p className="text-2xl font-bold text-white">
                    {analysis.metrics.totalItems}
                  </p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">
                    Itens com Reclamações
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {analysis.metrics.itemsWithComplaints}
                  </p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">
                    Custo Total de Reparos
                  </p>
                  <p className="text-2xl font-bold text-white">
                    R${" "}
                    {analysis.metrics.totalRepairCost.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">Nível de Risco</p>
                  <p
                    className={`text-2xl font-bold ${getRiskColor(
                      analysis.aiAnalysis?.riskLevel
                    )}`}
                  >
                    {analysis.aiAnalysis?.riskLevel || "N/A"}
                  </p>
                </div>
              </div>

              {/* Aviso se a IA não retornou dados */}
              {!analysis.aiAnalysis && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <h4 className="text-yellow-400 font-semibold mb-2">
                        Análise de IA Incompleta
                      </h4>
                      <p className="text-slate-300 text-sm mb-2">
                        A análise de IA não foi processada completamente pelo backend. 
                        Possíveis causas:
                      </p>
                      <ul className="text-slate-300 text-sm space-y-1 ml-4">
                        <li>• API do Gemini pode não estar configurada</li>
                        <li>• Chave da API pode estar inválida ou sem créditos</li>
                        <li>• Backend pode ter encontrado erro ao processar</li>
                        <li>• Empreendimento pode não ter reclamações suficientes</li>
                      </ul>
                      <p className="text-slate-400 text-xs mt-3">
                        Verifique os logs do backend para mais detalhes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Análise de IA - só mostra se existir */}
              {analysis.aiAnalysis && (
                <>
                  {analysis.aiAnalysis.summary && (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Resumo da Análise
                      </h3>
                      <p className="text-slate-300 leading-relaxed">
                        {analysis.aiAnalysis.summary}
                      </p>
                    </div>
                  )}

                  {!analysis.aiAnalysis.summary && (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Resumo da Análise
                      </h3>
                      <p className="text-slate-400 italic">
                        O resumo da análise não foi gerado pela IA. 
                        Verifique se o backend conseguiu processar a solicitação.
                      </p>
                    </div>
                  )}

                  {analysis.aiAnalysis.criticalPoints && analysis.aiAnalysis.criticalPoints.length > 0 && (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Pontos Críticos
                      </h3>
                      <ul className="space-y-2">
                        {analysis.aiAnalysis.criticalPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-400 mt-1">•</span>
                            <span className="text-slate-300">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.aiAnalysis.recommendations && analysis.aiAnalysis.recommendations.length > 0 && (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Recomendações
                      </h3>
                      <ul className="space-y-2">
                        {analysis.aiAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            <span className="text-slate-300">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.aiAnalysis.criticalSuppliers && analysis.aiAnalysis.criticalSuppliers.length > 0 && (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Fornecedores Críticos
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.aiAnalysis.criticalSuppliers.map(
                          (supplier, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/50"
                            >
                              {supplier}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Gráficos de Distribuição */}
              <div className="grid md:grid-cols-2 gap-6">
                {analysis.complaintsBySupplier && analysis.complaintsBySupplier.length > 0 && (
                  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Reclamações por Fornecedor
                    </h3>
                    <div className="space-y-2">
                      {analysis.complaintsBySupplier.slice(0, 5).map((item) => (
                        <div key={item.supplier}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">
                              {item.supplier}
                            </span>
                            <span className="text-slate-400">{item.count}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (item.count /
                                    Math.max(
                                      ...analysis.complaintsBySupplier.map(
                                        (s) => s.count
                                      )
                                    )) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.complaintsByIssue && analysis.complaintsByIssue.length > 0 && (
                  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Reclamações por Tipo
                    </h3>
                    <div className="space-y-2">
                      {analysis.complaintsByIssue.slice(0, 5).map((item) => (
                        <div key={item.issue}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">{item.issue}</span>
                            <span className="text-slate-400">{item.count}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (item.count /
                                    Math.max(
                                      ...analysis.complaintsByIssue.map(
                                        (i) => i.count
                                      )
                                    )) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botão para nova análise */}
              <div className="text-center pt-4">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg text-sm transition-colors"
                >
                  {loading ? "Analisando..." : "Atualizar Análise"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
