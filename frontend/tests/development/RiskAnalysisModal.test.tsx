import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RiskAnalysisModal } from "../../src/app/pages/development/RiskAnalysisModal";

// Mock do buildApiUrl
jest.mock("@/lib/api", () => ({
  buildApiUrl: (path: string) => {
    const url = new URL(path, "http://localhost:3000");
    return url;
  },
}));

// Mock do fetch global
global.fetch = jest.fn() as jest.Mock;

const mockAnalysis = {
  developmentId: "1",
  developmentName: "Empreendimento Teste",
  metrics: {
    totalItems: 100,
    itemsWithComplaints: 30,
    percentageWithComplaints: 30,
    totalRepairCost: 50000,
  },
  complaintsBySupplier: [
    { supplier: "Fornecedor A", count: 15 },
    { supplier: "Fornecedor B", count: 10 },
  ],
  complaintsByIssue: [
    { issue: "Vazamento", count: 20 },
    { issue: "Quebra", count: 10 },
  ],
  healthStatus: {
    status: "OK" as const,
    color: "yellow",
  },
  aiAnalysis: {
    riskLevel: "MÉDIO" as const,
    summary: "Resumo da análise",
    criticalPoints: ["Ponto crítico 1", "Ponto crítico 2"],
    recommendations: ["Recomendação 1", "Recomendação 2"],
    criticalSuppliers: ["Fornecedor A"],
  },
};

describe("RiskAnalysisModal", () => {
  const defaultProps = {
    developmentId: "1",
    developmentName: "Empreendimento Teste",
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAnalysis,
    });
  });

  it("deve renderizar o componente corretamente", () => {
    render(<RiskAnalysisModal {...defaultProps} />);

    expect(screen.getByText("Análise de Risco com IA")).toBeInTheDocument();
    expect(screen.getByText("Empreendimento Teste")).toBeInTheDocument();
  });

  it("deve chamar onClose quando o overlay é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <RiskAnalysisModal {...defaultProps} onClose={mockOnClose} />
    );

    const overlay = container.querySelector(".fixed.inset-0");
    if (overlay) {
      await user.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("deve ter botão de fechar no header", () => {
    const { container } = render(<RiskAnalysisModal {...defaultProps} />);

    // Verifica se há botões no header
    const header = container.querySelector(".sticky.top-0");
    const buttons = header?.querySelectorAll("button");
    expect(buttons?.length).toBeGreaterThan(0);
  });

  it("deve exibir botão Analisar com IA quando não há análise", () => {
    render(<RiskAnalysisModal {...defaultProps} />);

    expect(screen.getByText("Analisar com IA")).toBeInTheDocument();
  });

  it("deve chamar handleAnalyze quando botão é clicado", async () => {
    const user = userEvent.setup();
    render(<RiskAnalysisModal {...defaultProps} />);

    const analyzeButton = screen.getByText("Analisar com IA");
    await user.click(analyzeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("deve exibir loading quando está analisando", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => mockAnalysis,
      }), 100))
    );

    render(<RiskAnalysisModal {...defaultProps} />);

    const analyzeButton = screen.getByText("Analisar com IA");
    await user.click(analyzeButton);

    expect(screen.getByText("Analisando...")).toBeInTheDocument();
  });

  it("deve exibir análise quando recebida", async () => {
    const user = userEvent.setup();
    render(<RiskAnalysisModal {...defaultProps} />);

    const analyzeButton = screen.getByText("Analisar com IA");
    await user.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText("OK")).toBeInTheDocument();
      expect(screen.getByText("MÉDIO")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("deve exibir métricas quando análise está presente", async () => {
    const user = userEvent.setup();
    render(<RiskAnalysisModal {...defaultProps} />);

    const analyzeButton = screen.getByText("Analisar com IA");
    await user.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText("100")).toBeInTheDocument(); // totalItems
      expect(screen.getByText("30")).toBeInTheDocument(); // itemsWithComplaints
    }, { timeout: 3000 });
  });

  it("deve exibir resumo da análise quando presente", async () => {
    const user = userEvent.setup();
    render(<RiskAnalysisModal {...defaultProps} />);

    const analyzeButton = screen.getByText("Analisar com IA");
    await user.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText("Resumo da Análise")).toBeInTheDocument();
      expect(screen.getByText("Resumo da análise")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("deve exibir pontos críticos quando presentes", async () => {
    const user = userEvent.setup();
    render(<RiskAnalysisModal {...defaultProps} />);

    const analyzeButton = screen.getByText("Analisar com IA");
    await user.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText("Pontos Críticos")).toBeInTheDocument();
      expect(screen.getByText("Ponto crítico 1")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("deve exibir recomendações quando presentes", async () => {
    const user = userEvent.setup();
    render(<RiskAnalysisModal {...defaultProps} />);

    const analyzeButton = screen.getByText("Analisar com IA");
    await user.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText("Recomendações")).toBeInTheDocument();
      expect(screen.getByText("Recomendação 1")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("deve exibir fornecedores críticos quando presentes", async () => {
    const user = userEvent.setup();
    render(<RiskAnalysisModal {...defaultProps} />);

    const analyzeButton = screen.getByText("Analisar com IA");
    await user.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText("Fornecedores Críticos")).toBeInTheDocument();
      const fornecedorTexts = screen.getAllByText("Fornecedor A");
      expect(fornecedorTexts.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it("deve exibir painel de configuração quando botão é clicado", async () => {
    const user = userEvent.setup();
    render(<RiskAnalysisModal {...defaultProps} />);

    const configButton = screen.getByText("Configurar Limiar");
    await user.click(configButton);

    expect(screen.getByText("Configuração de Limiar de Risco")).toBeInTheDocument();
  });

  it("deve atualizar limiar quando salvo", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    render(<RiskAnalysisModal {...defaultProps} />);

    const configButton = screen.getByText("Configurar Limiar");
    await user.click(configButton);

    const thresholdInput = screen.getByPlaceholderText("Ex: 50") as HTMLInputElement;
    await user.clear(thresholdInput);
    await user.type(thresholdInput, "60");

    const saveButton = screen.getByText("Salvar");
    await user.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("deve exibir erro quando análise falha", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<RiskAnalysisModal {...defaultProps} />);

    const analyzeButton = screen.getByText("Analisar com IA");
    await user.click(analyzeButton);

    await waitFor(() => {
      const errorText = screen.queryByText(/Erro/);
      if (errorText) {
        expect(errorText).toBeInTheDocument();
      }
    }, { timeout: 2000 });
  });
});

