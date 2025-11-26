import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { DevelopmentDetailsModal } from "../../src/app/pages/development/DevelopmentdetailsModal";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock do CreateUnitModal
jest.mock("../../src/app/pages/development/CreateunitModal", () => ({
  CreateUnitModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="create-unit-modal">Create Unit Modal</div> : null,
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockDevelopment = {
  id: "1",
  nome: "Empreendimento Teste",
  descricao: "Descrição do empreendimento",
  endereco: "Rua Teste, 123",
};

const mockUnits = [
  {
    id: "1",
    nome: "Apto 101",
    numero: 101,
    andar: 1,
    torre: { id: "1", nome: "Torre A" },
  },
  {
    id: "2",
    nome: "Apto 102",
    numero: 102,
    andar: 1,
    torre: { id: "1", nome: "Torre A" },
  },
];

const mockBuildings = [
  { id: "1", nome: "Torre A" },
  { id: "2", nome: "Torre B" },
];

describe("DevelopmentDetailsModal", () => {
  const defaultProps = {
    development: mockDevelopment,
    units: [],
    buildings: mockBuildings,
    loadingUnits: false,
    unitsError: "",
    onClose: jest.fn(),
    onEdit: jest.fn(),
    onRefreshUnits: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("deve renderizar o componente corretamente", () => {
    render(<DevelopmentDetailsModal {...defaultProps} />);

    expect(screen.getByText("Detalhes do Empreendimento")).toBeInTheDocument();
    expect(screen.getByText("Empreendimento Teste")).toBeInTheDocument();
  });

  it("deve exibir informações do empreendimento", () => {
    render(<DevelopmentDetailsModal {...defaultProps} />);

    expect(screen.getByText("Empreendimento Teste")).toBeInTheDocument();
    expect(screen.getByText("Descrição do empreendimento")).toBeInTheDocument();
    expect(screen.getByText("Rua Teste, 123")).toBeInTheDocument();
  });

  it("deve exibir mensagem quando não há descrição", () => {
    const devWithoutDesc = { ...mockDevelopment, descricao: null };
    render(<DevelopmentDetailsModal {...defaultProps} development={devWithoutDesc} />);

    expect(screen.getByText("Sem descrição cadastrada")).toBeInTheDocument();
  });

  it("deve exibir mensagem quando não há endereço", () => {
    const devWithoutAddress = { ...mockDevelopment, endereco: null };
    render(<DevelopmentDetailsModal {...defaultProps} development={devWithoutAddress} />);

    expect(screen.getByText("Sem endereço cadastrado")).toBeInTheDocument();
  });

  it("deve exibir loading quando loadingUnits é true", () => {
    render(<DevelopmentDetailsModal {...defaultProps} loadingUnits={true} />);

    expect(screen.getByText("Carregando unidades...")).toBeInTheDocument();
  });

  it("deve exibir erro quando unitsError está presente", () => {
    render(<DevelopmentDetailsModal {...defaultProps} unitsError="Erro ao carregar unidades" />);

    expect(screen.getByText("Erro ao carregar unidades")).toBeInTheDocument();
  });

  it("deve exibir mensagem quando não há unidades", () => {
    render(<DevelopmentDetailsModal {...defaultProps} />);

    expect(screen.getByText("Nenhuma unidade cadastrada neste empreendimento")).toBeInTheDocument();
  });

  it("deve renderizar unidades quando fornecidas", () => {
    render(<DevelopmentDetailsModal {...defaultProps} units={mockUnits} />);

    expect(screen.getByText("Apto 101")).toBeInTheDocument();
    expect(screen.getByText("Apto 102")).toBeInTheDocument();
    const torreTexts = screen.getAllByText("Torre A");
    expect(torreTexts.length).toBeGreaterThan(0);
  });

  it("deve exibir botão Nova Unidade quando há buildings", () => {
    render(<DevelopmentDetailsModal {...defaultProps} />);

    expect(screen.getByText("Nova Unidade")).toBeInTheDocument();
  });

  it("deve abrir CreateUnitModal quando botão Nova Unidade é clicado", async () => {
    const user = userEvent.setup();
    render(<DevelopmentDetailsModal {...defaultProps} />);

    const newUnitButton = screen.getByText("Nova Unidade");
    await user.click(newUnitButton);

    expect(screen.getByTestId("create-unit-modal")).toBeInTheDocument();
  });

  it("deve chamar onClose quando o botão de fechar é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    render(<DevelopmentDetailsModal {...defaultProps} onClose={mockOnClose} />);

    const closeButton = screen.getByTitle("Fechar");
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("deve chamar router.push para cadastro de moradores", async () => {
    const user = userEvent.setup();
    render(<DevelopmentDetailsModal {...defaultProps} />);

    const button = screen.getByText("Cadastro de moradores");
    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith("/pages/development/1/register-users");
  });

  it("deve chamar router.push para cadastro de itens", async () => {
    const user = userEvent.setup();
    render(<DevelopmentDetailsModal {...defaultProps} />);

    const button = screen.getByText("Cadastrar itens");
    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith("/pages/development/1/register-items");
  });

  it("deve chamar onEdit quando botão Editar estrutura é clicado", async () => {
    const mockOnEdit = jest.fn();
    const user = userEvent.setup();
    render(<DevelopmentDetailsModal {...defaultProps} onEdit={mockOnEdit} />);

    const button = screen.getByText("Editar estrutura");
    await user.click(button);

    expect(mockOnEdit).toHaveBeenCalledWith(mockDevelopment);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});

