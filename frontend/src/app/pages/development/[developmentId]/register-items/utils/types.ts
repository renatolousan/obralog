export type Building = {
  id: string;
  nome: string;
};

export type Unit = {
  id: string;
  nome: string;
  numero: number;
  andar: number | null;
  torre: {
    id: string;
    nome: string;
  };
};

export type Supplier = {
  cnpj: string;
  name: string;
};

export type Installer = {
  id: string;
  cpf: string;
  name: string;
  phone: string;
};

export type RegisterMode = "individual" | "file";

export type ItemFormData = {
  name: string;
  description: string;
  value: string;
  batch: string;
  warranty: string;
  unitId: string;
  supplierCnpj: string;
  supplierName: string;
  installerCpf: string;
  installerName: string;
  installerPhone: string;
};

export const initialItemForm: ItemFormData = {
  name: "",
  description: "",
  value: "",
  batch: "",
  warranty: "",
  unitId: "",
  supplierCnpj: "",
  supplierName: "",
  installerCpf: "",
  installerName: "",
  installerPhone: "",
};

