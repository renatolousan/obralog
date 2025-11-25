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

interface TopSuppliersData {
  supplier: string;
  cnpj: string;
  totalFeedbacks: number;
}

interface ManagerialTopSuppliersProps {
  data: TopSuppliersData[];
}

export default function ManagerialTopSuppliers({
  data,
}: ManagerialTopSuppliersProps) {
  // Limitar a top 10 para melhor visualização
  const topData = data.slice(0, 10);

  const chartData = {
    labels: topData.map((item) => item.supplier),
    datasets: [
      {
        label: "Total de Ocorrências",
        data: topData.map((item) => item.totalFeedbacks),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
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
    name: item.supplier,
    value: item.totalFeedbacks,
    additionalInfo: item.cnpj,
  }));

  return (
    <IndicatorCard
      title="Fornecedores com Maior Número de Ocorrências"
      chartData={chartData}
      chartType="bar"
      rankingData={rankingData}
    >
      <Bar data={chartData} options={options} />
    </IndicatorCard>
  );
}

