import { STATUS_OPTIONS } from "./constants";

export const statusToClassName = (status: string) =>
  status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-");

export const getStatusLabel = (statusCode?: string) => {
  if (!statusCode) return "Status não informado";
  const option = STATUS_OPTIONS.find((opt) => opt.value === statusCode);
  return option ? option.label : statusCode;
};

export const formatDate = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

