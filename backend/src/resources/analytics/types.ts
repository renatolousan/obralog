export type RecurrentSuppliersSummary = {
  supplier: string;
  cnpj: string;
  totalFeedbacks: number;
}[];

export type RecurrentInstallersSummary = {
  installer: string;
  cpf: string;
  totalFeedbacks: number;
}[];

export type RecurrentBuildingsSummary = {
  building: string;
  id: string;
  totalFeedbacks: number;
}[];

export type RecurrentItemsSummary = {
  id: string;
  name: string;
  description: string;
  supplier: string | null;
  building: string | null;
  totalFeedbacks: number;
}[];

export type anyIndicator =
  | RecurrentBuildingsSummary
  | RecurrentInstallersSummary
  | RecurrentItemsSummary
  | RecurrentSuppliersSummary;
