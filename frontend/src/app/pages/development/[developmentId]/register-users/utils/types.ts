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

export type RegisterMode = "individual" | "file";

export type UserFormData = {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  unitId: string;
};

export const initialUserForm: UserFormData = {
  name: "",
  cpf: "",
  email: "",
  phone: "",
  unitId: "",
};

