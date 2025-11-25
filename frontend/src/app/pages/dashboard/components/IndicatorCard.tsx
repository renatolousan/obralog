"use client";

import React from "react";

interface IndicatorCardProps {
  title: string;
  children: React.ReactNode;
  rankingData: Array<{ name: string; value: number; additionalInfo?: string }>;
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  chartType: "bar" | "doughnut" | "line" | "pie";
  aiSuggestion?: string;
}

// Função para tratar sugestões da IA
function getSuggestionContent(aiSuggestion?: string, title?: string) {
  // Se não há sugestão ou é string vazia
  if (!aiSuggestion || aiSuggestion.trim() === "") {
    const placeholder = getPlaceholderSuggestion(title);
    return <span className="ml-2 italic text-muted">{placeholder}</span>;
  }

  // Se a sugestão contém erro
  if (
    aiSuggestion.toLowerCase().includes("erro") ||
    aiSuggestion.toLowerCase().includes("error") ||
    aiSuggestion.toLowerCase().includes("falha") ||
    aiSuggestion.toLowerCase().includes("failed")
  ) {
    return (
      <span className="ml-2 text-orange-400">
        ⚠️ Erro ao gerar sugestão. Tente novamente.
      </span>
    );
  }

  // Se a sugestão é muito curta (possivelmente inválida)
  if (aiSuggestion.trim().length < 10) {
    return (
      <span className="ml-2 italic text-muted">
        Sugestão em processamento...
      </span>
    );
  }

  // Sugestão válida
  return <span className="ml-2">{aiSuggestion}</span>;
}

// Função para gerar placeholders específicos por tipo de indicador
function getPlaceholderSuggestion(title?: string) {
  if (!title) return "Aguardando sugestão da IA...";

  const titleLower = title.toLowerCase();

  if (titleLower.includes("fornecedor")) {
    return "💡 Considere revisar contratos com fornecedores que apresentam mais incidentes.";
  }

  if (titleLower.includes("instalador")) {
    return "🔧 Avalie treinamento adicional para instaladores com maior número de problemas.";
  }

  if (titleLower.includes("prédio")) {
    return "🏢 Verifique infraestrutura e manutenção preventiva nos prédios com mais incidentes.";
  }

  if (titleLower.includes("item")) {
    return "📦 Analise qualidade dos itens e considere trocar fornecedores problemáticos.";
  }

  return "Aguardando sugestão da IA...";
}

export default function IndicatorCard({
  title,
  children,
  rankingData,
  chartData: _chartData, // eslint-disable-line @typescript-eslint/no-unused-vars
  chartType: _chartType, // eslint-disable-line @typescript-eslint/no-unused-vars
  aiSuggestion,
}: IndicatorCardProps) {
  return (
    <div className="indicator-card">
      <h3 className="indicator-title">{title}</h3>

      {/* Gráfico */}
      <div className="chart-container">{children}</div>

      {/* Ranking */}
      <div className="ranking-container">
        <h4 className="ranking-title">Ranking</h4>
        <div className="ranking-list">
          {rankingData.map((item, index) => (
            <div key={index} className="ranking-item">
              <span className="ranking-item-name">{item.name}</span>
              <span className="ranking-item-value">{item.value}</span>
              {item.additionalInfo && (
                <span className="ranking-item-info">{item.additionalInfo}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sugestão */}
      <div className="suggestion-text">
        <strong>Sugestão:</strong>
        {getSuggestionContent(aiSuggestion, title)}
      </div>
    </div>
  );
}
