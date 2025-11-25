"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import IndicatorCard from "./IndicatorCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopInstallersData {
  installer: string;
  cpf: string;
  totalFeedbacks: number;
}

interface ManagerialTopInstallersProps {
  data: TopInstallersData[];
}

export default function ManagerialTopInstallers({
  data,
}: ManagerialTopInstallersProps) {
  // Limitar a top 10 para melhor visualização
  const topData = data.slice(0, 10);

  const chartData = {
    labels: topData.map((item) => item.installer),
    datasets: [
      {
        label: "Frequência de Falhas",
        data: topData.map((item) => item.totalFeedbacks),
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
      title="Instaladores/Prestadores com Maior Frequência de Falhas"
      chartData={chartData}
      chartType="bar"
      rankingData={rankingData}
    >
      <Bar data={chartData} options={options} />
    </IndicatorCard>
  );
}

