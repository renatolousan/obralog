import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { DevelopmentsTable } from "../../src/app/pages/development/developmentTable";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock dos modais
jest.mock("../../src/app/pages/development/DevelopmentdetailsModal", () => ({
  DevelopmentDetailsModal: ({ development }: { development: any }) =>
    development ? <div data-testid="details-modal">{development.nome}</div> : null,
}));

jest.mock("../../src/app/pages/development/reportsModal", () => ({
  ReportsModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="reports-modal">Reports Modal</div> : null,
}));

jest.mock("../../src/app/pages/development/RiskAnalysisModal", () => ({
  RiskAnalysisModal: ({ developmentId }: { developmentId: string }) =>
    developmentId ? <div data-testid="risk-modal">{developmentId}</div> : null,
}));

// Mock do fetch global
global.fetch = jest.fn() as jest.Mock;

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockDevelopments = [
  {
    id: "1",
    nome: "Empreendimento A",
    descricao: "Descrição A",
    endereco: "Endereço A",
  },
  {
    id: "2",
    nome: "Empreendimento B",
    descricao: "Descrição B",
    endereco: "Endereço B",
  },
];

describe("DevelopmentsTable", () => {
  const defaultProps = {
    data: mockDevelopments,
    total: 2,
    loading: false,
    error: null,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  it("deve renderizar o componente corretamente", () => {
    render(<DevelopmentsTable {...defaultProps} />);

    expect(screen.getByText(/de 2 resultados/)).toBeInTheDocument();
    expect(screen.getByText("Empreendimento A")).toBeInTheDocument();
  });

  it("deve renderizar os empreendimentos", () => {
    render(<DevelopmentsTable {...defaultProps} />);

    expect(screen.getByText("Empreendimento A")).toBeInTheDocument();
    expect(screen.getByText("Empreendimento B")).toBeInTheDocument();
  });

  it("deve exibir loading quando loading é true", () => {
    render(<DevelopmentsTable {...defaultProps} loading={true} />);

    const skeletonRows = screen.getAllByRole("row");
    expect(skeletonRows.length).toBeGreaterThan(1);
  });

  it("deve exibir erro quando error está presente", () => {
    render(<DevelopmentsTable {...defaultProps} error="Erro ao carregar" />);

    expect(screen.getByText("Erro ao carregar")).toBeInTheDocument();
  });

  it("deve filtrar empreendimentos pela busca", async () => {
    const user = userEvent.setup();
    render(<DevelopmentsTable {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Buscar por nome, descrição, endereço…");
    await user.type(searchInput, "A");

    expect(screen.getByText("Empreendimento A")).toBeInTheDocument();
    expect(screen.queryByText("Empreendimento B")).not.toBeInTheDocument();
  });

  it("deve abrir modal de detalhes quando botão de detalhes é clicado", async () => {
    const user = userEvent.setup();
    render(<DevelopmentsTable {...defaultProps} />);

    const detailsButtons = screen.getAllByTitle("Ver Detalhes");
    await user.click(detailsButtons[0]);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.getByTestId("details-modal")).toBeInTheDocument();
  });

  it("deve chamar router.push para dashboard", async () => {
    const user = userEvent.setup();
    render(<DevelopmentsTable {...defaultProps} />);

    const dashboardButtons = screen.getAllByTitle("Dashboard");
    await user.click(dashboardButtons[0]);

    expect(mockPush).toHaveBeenCalledWith("/pages/dashboard?developmentId=1");
  });

  it("deve chamar router.push para reclamações", async () => {
    const user = userEvent.setup();
    render(<DevelopmentsTable {...defaultProps} />);

    const reclamacoesButtons = screen.getAllByTitle("Reclamações");
    await user.click(reclamacoesButtons[0]);

    expect(mockPush).toHaveBeenCalledWith("/pages/developments/1/reclamacoes");
  });

  it("deve abrir modal de relatórios quando botão é clicado", async () => {
    const user = userEvent.setup();
    render(<DevelopmentsTable {...defaultProps} />);

    const reportsButtons = screen.getAllByTitle("Relatórios");
    await user.click(reportsButtons[0]);

    expect(screen.getByTestId("reports-modal")).toBeInTheDocument();
  });

  it("deve abrir modal de análise de risco quando botão é clicado", async () => {
    const user = userEvent.setup();
    render(<DevelopmentsTable {...defaultProps} />);

    const riskButtons = screen.getAllByTitle("Análise de Risco com IA");
    await user.click(riskButtons[0]);

    expect(screen.getByTestId("risk-modal")).toBeInTheDocument();
  });

  it("deve exibir mensagem quando não há resultados na busca", async () => {
    const user = userEvent.setup();
    render(<DevelopmentsTable {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Buscar por nome, descrição, endereço…");
    await user.type(searchInput, "XYZ123");

    expect(screen.getByText(/Nenhum resultado para/)).toBeInTheDocument();
  });
});

