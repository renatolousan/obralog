"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "./hooks/useAnalytics";
import SuppliersIndicator from "./components/SuppliersIndicator";
import InstallersIndicator from "./components/InstallersIndicator";
import BuildingsIndicator from "./components/BuildingsIndicator";
import ItemsIndicator from "./components/ItemsIndicator";
import "./index.css";

interface DashboardProps {
  searchParams: Promise<{ developmentId?: string }>;
}

export default function Dashboard({ searchParams }: DashboardProps) {
  const router = useRouter();
  const resolvedSearchParams = React.use(searchParams);
  const developmentId = resolvedSearchParams.developmentId || "";

  const { data, loading, error } = useAnalytics(developmentId);

  const handleBackToDevelopments = () => {
    router.push("/pages/development");
  };

  if (loading) {
    return (
      <div className="min-h-screen loading-container flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner animate-spin rounded-full h-32 w-32 border-4 border-solid mx-auto"></div>
          <p className="mt-4 text-muted">Carregando indicadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen error-container flex items-center justify-center">
        <div className="text-center">
          <div className="error-icon text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar dados</h2>
          <p className="text-muted mb-4">{error}</p>
          <button onClick={handleBackToDevelopments} className="back-button">
            ← Voltar para Desenvolvimentos
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen error-container flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold mb-2">Nenhum dado encontrado</h2>
          <p className="text-muted mb-4">
            Não há dados de indicadores disponíveis para este desenvolvimento.
          </p>
          <button onClick={handleBackToDevelopments} className="back-button">
            ← Voltar para Desenvolvimentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="dashboard-title">📊 Dashboard de Indicadores</h1>
            <button onClick={handleBackToDevelopments} className="back-button">
              ← Voltar para Desenvolvimentos
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Fornecedores */}
          <div className="h-full">
            <SuppliersIndicator
              data={data.suppliers}
              aiSuggestion={data.aiSuggestions.suppliers}
            />
          </div>

          {/* Instaladores */}
          <div className="h-full">
            <InstallersIndicator
              data={data.installers}
              aiSuggestion={data.aiSuggestions.installers}
            />
          </div>

          {/* Prédios */}
          <div className="h-full">
            <BuildingsIndicator
              data={data.buildings}
              aiSuggestion={data.aiSuggestions.buildings}
            />
          </div>

          {/* Itens */}
          <div className="h-full">
            <ItemsIndicator
              data={data.items}
              aiSuggestion={data.aiSuggestions.items}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
