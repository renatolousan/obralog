export const STATUS_OPTIONS = [
  { value: "ABERTO", label: "Aberto" },
  { value: "EM_ANALISE", label: "Em Análise" },
  { value: "VISITA_AGENDADA", label: "Visita Agendada" },
  { value: "AGUARDANDO_FEEDBACK", label: "Aguardando Feedback" },
  { value: "FECHADO", label: "Fechado" },
] as const;

export const createEmptyFilters = () => ({
  startDate: "",
  endDate: "",
  developmentId: "",
  buildingId: "",
  unitId: "",
  itemId: "",
  supplierId: "",
  installerId: "",
  statuses: [],
});

export type Filters = {
  startDate: string;
  endDate: string;
  itemId: string;
  supplierId: string;
  installerId: string;
  statuses: string[];
  developmentId: string;
  buildingId: string;
  unitId: string;
};
