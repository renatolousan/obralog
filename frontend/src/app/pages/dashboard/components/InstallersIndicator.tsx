"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import IndicatorCard from "./IndicatorCard";
import { InstallerData } from "../types/analytics";

ChartJS.register(ArcElement, Tooltip, Legend);

interface InstallersIndicatorProps {
  data: InstallerData[];
  aiSuggestion?: string;
}

export default function InstallersIndicator({
  data,
  aiSuggestion,
}: InstallersIndicatorProps) {
  const topInstallers = data.slice(0, 5);
  const othersCount = data
    .slice(5)
    .reduce((sum, item) => sum + item.totalFeedbacks, 0);

  const chartData = {
    labels: [
      ...topInstallers.map((item) => item.installer),
      ...(othersCount > 0 ? ["Outros"] : []),
    ],
    datasets: [
      {
        label: "Total de Feedbacks",
        data: [
          ...topInstallers.map((item) => item.totalFeedbacks),
          ...(othersCount > 0 ? [othersCount] : []),
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 205, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 10,
          },
        },
      },
    },
  };

  const rankingData = data.map((item) => ({
    name: item.installer,
    value: item.totalFeedbacks,
    additionalInfo: item.cpf,
  }));

  return (
    <IndicatorCard
      title="Instaladores com Mais Incidentes"
      chartData={chartData}
      chartType="doughnut"
      rankingData={rankingData}
      aiSuggestion={aiSuggestion}
    >
      <Doughnut data={chartData} options={options} />
    </IndicatorCard>
  );
}
