export const availableReports: {
  title: string;
  endpoint: string;
  haveInterval: boolean;
  isGeneral: boolean; // true = aparece no modal geral, false = apenas no modal específico da obra
}[] = [
  {
    title: "Reclamações por mês",
    endpoint: "/api/reports/:id/complaint",
    haveInterval: true,
    isGeneral: false,
  },
  {
    title: "Relatório Geral de Reclamações",
    endpoint: "/api/reports/complaints",
    haveInterval: false,
    isGeneral: true,
  },
  {
    title: "Relatório Geral de Reclamações por Item",
    endpoint: "/api/reports/items",
    haveInterval: false,
    isGeneral: true,
  },
  {
    title: "Relatório Geral de Custos",
    endpoint: "/api/reports/:id/",
    haveInterval: false,
    isGeneral: false,
  },
];
