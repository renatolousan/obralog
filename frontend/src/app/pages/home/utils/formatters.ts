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

export const getStatusVariant = (statusCode?: string) => {
  if (!statusCode || !statusCode.trim().length) {
    return "unknown";
  }
  return statusToClassName(statusCode);
};

export const formatVisitDate = (raw: Date | string) => {
  const dateObj =
    typeof raw === "string"
      ? new Date(raw)
      : raw instanceof Date
      ? raw
      : new Date(String(raw));
  if (isNaN(dateObj.getTime())) return "Data inválida";
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yyyy = String(dateObj.getFullYear());
  const hh = String(dateObj.getHours()).padStart(2, "0");
  const min = String(dateObj.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} às ${hh}:${min}`;
};

export const getStatusColors = (variant: string) => {
  const colors: Record<string, string> = {
    aberto:
      "bg-orange-950/30 border-orange-800/40 text-orange-200",
    "em-analise":
      "bg-blue-950/30 border-blue-800/40 text-blue-200",
    "visita-agendada":
      "bg-purple-950/30 border-purple-800/40 text-purple-200",
    "aguardando-feedback":
      "bg-yellow-950/30 border-yellow-800/40 text-yellow-200",
    fechado:
      "bg-green-950/30 border-green-800/40 text-green-200",
    unknown:
      "bg-slate-800/30 border-slate-700 text-slate-400",
  };
  return colors[variant] || colors["unknown"];
};

export const getStatusHighlightColors = (variant: string) => {
  const colors: Record<string, string> = {
    aberto:
      "bg-orange-950/12 border-orange-800/35 text-orange-200 shadow-[inset_0_0_0_1px_rgba(255,140,105,0.18)]",
    "em-analise":
      "bg-blue-950/12 border-blue-800/35 text-blue-200 shadow-[inset_0_0_0_1px_rgba(124,150,255,0.18)]",
    "visita-agendada":
      "bg-purple-950/12 border-purple-800/35 text-purple-200 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.18)]",
    "aguardando-feedback":
      "bg-yellow-950/12 border-yellow-800/35 text-yellow-200 shadow-[inset_0_0_0_1px_rgba(234,179,8,0.18)]",
    fechado:
      "bg-green-950/12 border-green-800/35 text-green-200 shadow-[inset_0_0_0_1px_rgba(152,231,193,0.18)]",
    unknown:
      "bg-slate-800/18 border-slate-700/35 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  };
  return colors[variant] || colors["unknown"];
};

