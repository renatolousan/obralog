export type Option = {
  id: string;
  nome: string;
};

export type ItemOption = {
  id: string;
  nome: string;
  descricao?: string | null;
};

export type Attachment = {
  id: string;
  nome_original: string;
  nome_arquivo: string;
  caminho: string;
  tipo: string;
  tamanho?: string | number;
};

export type Visita = {
  id: string;
  feedback_id: string;
  date: Date;
  duration: number;
  confirmed: boolean;
  foremen: {
    id: string;
    name: string;
    cpf: string;
    phone: string;
    visitId: string | null;
  }[];
};

export type Atividade = {
  id: string;
  data_hora: string;
  descricao: string;
  issue: string;
  id_item: string | number;
  status: string;
  status_codigo?: string;
  id_usuario?: string;
  anexos?: Attachment[];
  visita: Visita | null;
  item?: {
    id: string;
    nome: string;
    descricao?: string | null;
    fornecedor?: Option;
    instaladores?: Option[];
  };
  unidade?: {
    id: string;
    nome: string;
    numero?: number;
    andar?: number | null;
    id_building?: string;
  };
  torre?: {
    id: string;
    id_development: string;
  };
  development?: {
    id: string;
  };
};

export type Filters = {
  startDate: string;
  endDate: string;
  developmentId: string;
  buildingId: string;
  unitId: string;
  itemId: string;
  supplierId: string;
  installerId: string;
  statuses: string[];
};

export type ListResponse<T> = {
  total?: number;
  data?: T;
  message?: string;
};

