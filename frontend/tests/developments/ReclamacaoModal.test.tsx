import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReclamacaoModal } from "../../src/app/pages/developments/[developmentId]/reclamacoes/components/ReclamacaoModal";
import type { Reclamacao } from "../../src/app/pages/developments/[developmentId]/reclamacoes/utils/types";
import type { VisitFormData } from "../../src/app/pages/developments/[developmentId]/reclamacoes/hooks/useVisitForm";
import type { InstallerOption } from "../../src/app/pages/developments/[developmentId]/reclamacoes/utils/types";

// Mock do Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, unoptimized, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock do buildBackendUrl
jest.mock("@/app/api/_lib/backend", () => ({
  buildBackendUrl: (path: string) => {
    const url = new URL(path, "http://localhost:3000");
    return url;
  },
}));

const mockReclamacao: Reclamacao = {
  id: "1",
  issue: "ISSUE-001",
  status: "ABERTO",
  id_item: "item-1",
  description: "Descrição da reclamação",
  created_at: new Date("2024-01-15T10:30:00"),
  id_user: "user-1",
  user: {
    name: "João Silva",
    email: "joao@example.com",
  },
  item: {
    name: "Item Teste",
    unit: {
      number: 101,
      name: "Unidade 101",
      floor: 1,
      torre: {
        name: "Torre A",
      },
    },
  },
  attachments: [],
};

const mockReclamacaoEmAnalise: Reclamacao = {
  ...mockReclamacao,
  status: "EM_ANALISE",
};

const mockReclamacaoAguardandoFeedback: Reclamacao = {
  ...mockReclamacao,
  status: "AGUARDANDO_FEEDBACK",
};

const mockInstallers: InstallerOption[] = [
  {
    id: "installer-1",
    name: "Instalador 1",
    phone: "(11) 98765-4321",
    cpf: "123.456.789-00",
  },
];

const defaultVisitFormData: VisitFormData = {
  date: "",
  time: "",
  duration: "60",
  foremen_id: [],
  repairCost: "",
  id_installer: "",
};

describe("ReclamacaoModal", () => {
  const defaultProps = {
    reclamacao: mockReclamacao,
    isOpen: false,
    showVisitForm: false,
    visitFormData: defaultVisitFormData,
    installers: [],
    loadingInstallers: false,
    visitFormError: null,
    updatingStatus: false,
    onClose: jest.fn(),
    onImageClick: jest.fn(),
    onPutInAnalysis: jest.fn(),
    onOpenVisitForm: jest.fn(),
    onCloseVisitForm: jest.fn(),
    onVisitFormFieldChange: jest.fn(),
    onToggleForeman: jest.fn(),
    onScheduleVisit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não deve renderizar quando isOpen é false", () => {
    const { container } = render(<ReclamacaoModal {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar quando isOpen é true", () => {
    render(<ReclamacaoModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Detalhes da Reclamação")).toBeInTheDocument();
  });

  it("deve chamar onClose quando o botão de fechar é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    render(<ReclamacaoModal {...defaultProps} isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText("Fechar");
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onClose quando o overlay é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ReclamacaoModal {...defaultProps} isOpen={true} onClose={mockOnClose} />
    );

    const overlay = container.querySelector(".modal-overlay") as HTMLElement;
    if (overlay) {
      await user.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("não deve chamar onClose quando o conteúdo do modal é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ReclamacaoModal {...defaultProps} isOpen={true} onClose={mockOnClose} />
    );

    const content = container.querySelector(".modal-content") as HTMLElement;
    if (content) {
      await user.click(content);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it("deve exibir botão 'Colocar em Análise' quando status é ABERTO", () => {
    render(<ReclamacaoModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Colocar em Análise")).toBeInTheDocument();
  });

  it("deve chamar onPutInAnalysis quando o botão 'Colocar em Análise' é clicado", async () => {
    const mockOnPutInAnalysis = jest.fn();
    const user = userEvent.setup();
    render(
      <ReclamacaoModal
        {...defaultProps}
        isOpen={true}
        onPutInAnalysis={mockOnPutInAnalysis}
      />
    );

    const button = screen.getByText("Colocar em Análise");
    await user.click(button);

    expect(mockOnPutInAnalysis).toHaveBeenCalledTimes(1);
  });

  it("deve desabilitar o botão quando updatingStatus é true", () => {
    render(
      <ReclamacaoModal
        {...defaultProps}
        isOpen={true}
        updatingStatus={true}
      />
    );

    const button = screen.getByText("Atualizando...") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("deve exibir botão 'Agendar Visita' quando status é EM_ANALISE e showVisitForm é false", () => {
    render(
      <ReclamacaoModal
        {...defaultProps}
        isOpen={true}
        reclamacao={mockReclamacaoEmAnalise}
        showVisitForm={false}
      />
    );

    expect(screen.getByText("Agendar Visita")).toBeInTheDocument();
  });

  it("deve chamar onOpenVisitForm quando o botão 'Agendar Visita' é clicado", async () => {
    const mockOnOpenVisitForm = jest.fn();
    const user = userEvent.setup();
    render(
      <ReclamacaoModal
        {...defaultProps}
        isOpen={true}
        reclamacao={mockReclamacaoEmAnalise}
        showVisitForm={false}
        onOpenVisitForm={mockOnOpenVisitForm}
      />
    );

    const button = screen.getByText("Agendar Visita");
    await user.click(button);

    expect(mockOnOpenVisitForm).toHaveBeenCalledTimes(1);
  });

  it("deve exibir VisitForm quando status é EM_ANALISE e showVisitForm é true", () => {
    render(
      <ReclamacaoModal
        {...defaultProps}
        isOpen={true}
        reclamacao={mockReclamacaoEmAnalise}
        showVisitForm={true}
        installers={mockInstallers}
      />
    );

    expect(screen.getByText("Agendar Visita")).toBeInTheDocument();
  });

  it("não deve exibir ações quando status é AGUARDANDO_FEEDBACK", () => {
    render(
      <ReclamacaoModal
        {...defaultProps}
        isOpen={true}
        reclamacao={mockReclamacaoAguardandoFeedback}
      />
    );

    expect(screen.queryByText("Colocar em Análise")).not.toBeInTheDocument();
    expect(screen.queryByText("Agendar Visita")).not.toBeInTheDocument();
  });

  it("deve exibir botão Fechar sempre", () => {
    render(<ReclamacaoModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Fechar")).toBeInTheDocument();
  });

  it("deve passar props corretas para ReclamacaoDetails", () => {
    const mockOnImageClick = jest.fn();
    render(
      <ReclamacaoModal
        {...defaultProps}
        isOpen={true}
        onImageClick={mockOnImageClick}
      />
    );

    expect(screen.getByText("ISSUE-001")).toBeInTheDocument();
  });
});

