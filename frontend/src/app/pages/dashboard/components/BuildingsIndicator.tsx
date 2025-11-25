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
import { BuildingData } from "../types/analytics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BuildingsIndicatorProps {
  data: BuildingData[];
  aiSuggestion?: string;
}

export default function BuildingsIndicator({
  data,
  aiSuggestion,
}: BuildingsIndicatorProps) {
  const chartData = {
    labels: data.slice(0, 8).map((item) => item.building),
    datasets: [
      {
        label: "Total de Feedbacks",
        data: data.slice(0, 8).map((item) => item.totalFeedbacks),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
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
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const rankingData = data.map((item) => ({
    name: item.building,
    value: item.totalFeedbacks,
  }));

  return (
    <IndicatorCard
      title="Prédios com Mais Incidentes"
      chartData={chartData}
      chartType="bar"
      rankingData={rankingData}
      aiSuggestion={aiSuggestion}
    >
      <Bar data={chartData} options={options} />
    </IndicatorCard>
  );
}
