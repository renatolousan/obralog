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

interface TopItemsData {
  id: string;
  name: string;
  description: string;
  supplier: string | null;
  building: string | null;
  totalFeedbacks: number;
}

interface ManagerialTopItemsProps {
  data: TopItemsData[];
}

export default function ManagerialTopItems({
  data,
}: ManagerialTopItemsProps) {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: "Total de Reclamações",
        data: data.map((item) => item.totalFeedbacks),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
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
    name: item.name,
    value: item.totalFeedbacks,
    additionalInfo: item.supplier || "Sem fornecedor",
  }));

  return (
    <IndicatorCard
      title="Top 5 Itens Mais Reclamados"
      chartData={chartData}
      chartType="bar"
      rankingData={rankingData}
    >
      <Bar data={chartData} options={options} />
    </IndicatorCard>
  );
}

