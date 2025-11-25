"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useManagerialDashboard } from "../hooks/useManagerialDashboard";
import ManagerialTopItems from "../components/ManagerialTopItems";
import ManagerialTopSuppliers from "../components/ManagerialTopSuppliers";
import ManagerialTopInstallers from "../components/ManagerialTopInstallers";
import "../index.css";

export default function ManagerialDashboard() {
  const router = useRouter();
  const { data, loading, error } = useManagerialDashboard();

  const handleBackToDevelopments = () => {
    router.push("/pages/development");
  };

  if (loading) {
    return (
      <div className="min-h-screen loading-container flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner animate-spin rounded-full h-32 w-32 border-4 border-solid mx-auto"></div>
          <p className="mt-4 text-muted">Carregando dashboard gerencial...</p>
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
            Não há dados disponíveis para o dashboard gerencial.
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
            <h1 className="dashboard-title">📊 Dashboard Gerencial</h1>
            <button onClick={handleBackToDevelopments} className="back-button">
              ← Voltar para Desenvolvimentos
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Itens Mais Reclamados */}
          <div className="h-[600px]">
            <ManagerialTopItems data={data.topItems} />
          </div>

          {/* Fornecedores com Maior Número de Ocorrências */}
          <div className="h-[600px]">
            <ManagerialTopSuppliers data={data.topSuppliers} />
          </div>

          {/* Instaladores/Prestadores com Maior Frequência de Falhas */}
          <div className="h-[600px] lg:col-span-2">
            <ManagerialTopInstallers data={data.topInstallers} />
          </div>
        </div>
      </div>
    </div>
  );
}

