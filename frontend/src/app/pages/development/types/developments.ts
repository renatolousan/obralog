// types/development.ts
export type Development = {
  id: number | string;
  nome: string;
  descricao: string | null;
  endereco: string | null;
};

export type ApiListResponse<T> = {
  total: number;
  data: T[];
  message?: string;
};

