export type InstallerOption = {
  id: string;
  name: string;
  phone: string;
  cpf: string;
};

export type Reclamacao = {
  user: {
    name: string;
    email: string;
  };
  item: {
    name: string;
    unit: {
      number: number;
      name: string;
      floor: number;
      torre: {
        name: string;
      };
    };
  };
  attachments: {
    id: string;
    created_at: Date | string;
    original_name: string;
    file_name: string;
    path: string;
    mime_type: string;
    size: string | number;
    feedback_id?: string;
  }[];
  installer?: {
    id: string;
    name: string;
    cpf?: string;
    phone?: string;
  };
} & {
  issue: string;
  status: string;
  id_item: string;
  id: string;
  description: string;
  created_at: Date | string;
  id_user: string;
  repairCost?: number;
  completedAt?: Date | string;
};

