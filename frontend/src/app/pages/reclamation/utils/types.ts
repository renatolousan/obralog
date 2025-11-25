export type ItemOption = {
  id: string;
  nome: string;
  descricao?: string | null;
};

export type AttachmentPreview = {
  id: string;
  file: File;
  previewUrl: string;
};

export type ReclamacaoForm = {
  itemId: string;
  issue: string;
  descricao: string;
  anexos: AttachmentPreview[];
};

export type ApiListResponse<T> = {
  total?: number;
  data?: T;
  message?: string;
};

export const initialForm: ReclamacaoForm = {
  itemId: "",
  issue: "",
  descricao: "",
  anexos: [],
};

