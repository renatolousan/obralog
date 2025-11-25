import {
  type Attachment as AttachmentModel,
  type Feedback as FeedbackModel,
  type Feedback,
  type Item as ItemModel,
  type Unit as UnitModel,
  type Building as BuildingModel,
  type Supplier as SupplierModel,
  type Installer as InstallerModel,
  User,
  Development,
  Building,
  Unit,
  Item,
  Installer,
  Supplier,
  Visit,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export type FeedbackWithRelations = FeedbackModel & {
  attachments: AttachmentModel[];
  scheduled_visit: (Visit & { foremen: Installer[] }) | null;
  item:
    | (ItemModel & {
        unit: (UnitModel & { torre: BuildingModel | null }) | null;
        supplier: SupplierModel | null;
        installers: InstallerModel[];
      })
    | null;
};

export type FeedbackWithAttachments = FeedbackModel & {
  attachments: AttachmentModel[];
};

export type UploadedFile = Express.Multer.File;

export type orderKeyType = 'asc' | 'desc';

export type UserRegisterDto = Pick<
  User,
  'email' | 'name' | 'phone' | 'unitId' | 'userType' | 'cpf'
>;

export type UserLoginDto = Pick<User, 'email' | 'password'>;

export enum UserTypes {
  admin = '924fec72-a812-4a44-a7e1-90b6df0b31b1',
  buildingManager = 'e3b0c442-98fc-1fc1-9b93-7c4b8f9a1c2e',
  client = '6e503925-8456-4e76-8e42-c80b0abee6fc',
}

export type InstallerDto = Pick<Installer, 'cpf' | 'name' | 'phone'>;

export type ItemDto = Pick<Item, 'name' | 'description' | 'cnpj_supplier'> & {
  installers: InstallerDto[];
  supplier: Supplier; // {name, cnpj}
  value?: number | null;
  batch?: string | null;
  warranty?: number | null;
};

export type UnitDto = Pick<Unit, 'floor' | 'number' | 'name'>;

export type BuildingDto = Pick<Building, 'name'> & {
  units: UnitDto[];
};

export type DevelopmentDto = Pick<
  Development,
  'name' | 'description' | 'address'
> & {
  buildings: BuildingDto[];
};

export type VisitDto = Pick<Visit, 'date' | 'duration'> & {
  foremen_id: string[];
  repairCost?: number;
  id_installer?: string;
};

export type ComplaintStatusUpdate =
  | {
      statusFlag: 'ABERTO';
    }
  | {
      statusFlag: 'EM_ANALISE';
    }
  | {
      statusFlag: 'VISITA_AGENDADA';
      data: VisitDto;
    }
  | {
      statusFlag: 'AGUARDANDO_FEEDBACK';
      data: { confirm_visit: boolean };
    }
  | {
      statusFlag: 'FECHADO';
      data: { liked: boolean; comment?: string };
    };

export type UserCSVRegisterDto = Pick<
  User,
  'name' | 'cpf' | 'email' | 'phone'
> & {
  unit_number: number;
  floor: number;
  building_name: string;
};

export type developmentSummary = {
  obra: {
    id: string;
    nome: string;
    descricao: string;
    endereco: string;
  };
  estatisticas: {
    total_reclamacoes: number;
    total_custo_reparo: number;
    total_visitas: number;
    torres: number;
  };
  torres: {
    nome: string;
    unidades: {
      nome: string;
      itens: {
        nome: string;
        fornecedor: string;
        valor: Decimal | null;
        lote: string | null;
        reclamacoes: number;
      }[];
    }[];
  }[];
};

export type ItemCSVRegisterDto = Pick<
  Item,
  'name' | 'description' | 'value' | 'batch' | 'warranty'
> & {
  unit_name: string;
  unit_number: number;
  floor: number;
  building_name: string;
  supplier_cnpj: string;
  supplier_name: string;
  installer_cpf: string;
  installer_name: string;
};
