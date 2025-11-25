export interface SupplierData {
  supplier: string;
  cnpj: string;
  totalFeedbacks: number;
}

export interface InstallerData {
  installer: string;
  cpf: string;
  totalFeedbacks: number;
}

export interface BuildingData {
  building: string;
  id: string;
  totalFeedbacks: number;
}

export interface ItemData {
  id: string;
  name: string;
  description: string;
  supplier: string | null;
  building: string | null;
  totalFeedbacks: number;
}

export interface AnalyticsData {
  suppliers: SupplierData[];
  installers: InstallerData[];
  buildings: BuildingData[];
  items: ItemData[];
  aiSuggestions: {
    suppliers: string;
    installers: string;
    buildings: string;
    items: string;
  };
}
