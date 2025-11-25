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
import { SupplierData } from "../types/analytics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SuppliersIndicatorProps {
  data: SupplierData[];
  aiSuggestion?: string;
}

export default function SuppliersIndicator({
  data,
  aiSuggestion,
}: SuppliersIndicatorProps) {
  const chartData = {
    labels: data.slice(0, 5).map((item) => item.supplier),
    datasets: [
      {
        label: "Total de Feedbacks",
        data: data.slice(0, 5).map((item) => item.totalFeedbacks),
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
      title="Fornecedores com Mais Incidentes"
      chartData={chartData}
      chartType="bar"
      rankingData={rankingData}
      aiSuggestion={aiSuggestion}
    >
      <Bar data={chartData} options={options} />
    </IndicatorCard>
  );
}
