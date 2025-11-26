import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReclamacoesTable } from "../../src/app/pages/developments/[developmentId]/reclamacoes/components/ReclamacoesTable";
import type { Reclamacao } from "../../src/app/pages/developments/[developmentId]/reclamacoes/utils/types";

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

const mockReclamacaoLongDescription: Reclamacao = {
  ...mockReclamacao,
  id: "2",
  description: "A".repeat(100),
};

describe("ReclamacoesTable", () => {
  const defaultProps = {
    reclamacoes: [],
    loading: false,
    onRowClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o componente corretamente", () => {
    render(<ReclamacoesTable {...defaultProps} />);

    expect(screen.getByText("Descrição")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Usuário")).toBeInTheDocument();
    expect(screen.getByText("Item")).toBeInTheDocument();
    expect(screen.getByText("Data de Criação")).toBeInTheDocument();
  });

  it("deve exibir mensagem de carregamento quando loading é true", () => {
    render(<ReclamacoesTable {...defaultProps} loading={true} />);

    expect(screen.getByText("Carregando reclamações…")).toBeInTheDocument();
  });

  it("deve exibir mensagem quando não há reclamações", () => {
    render(<ReclamacoesTable {...defaultProps} />);

    expect(screen.getByText("Nenhuma reclamação encontrada.")).toBeInTheDocument();
  });

  it("deve renderizar reclamações quando fornecidas", () => {
    render(<ReclamacoesTable {...defaultProps} reclamacoes={[mockReclamacao]} />);

    expect(screen.getByText("Descrição da reclamação")).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Item Teste")).toBeInTheDocument();
  });

  it("deve truncar descrições longas", () => {
    render(
      <ReclamacoesTable
        {...defaultProps}
        reclamacoes={[mockReclamacaoLongDescription]}
      />
    );

    const description = screen.getByText(/^A{80}\.\.\.$/);
    expect(description).toBeInTheDocument();
  });

  it("deve chamar onRowClick quando uma linha é clicada", async () => {
    const mockOnRowClick = jest.fn();
    const user = userEvent.setup();
    render(
      <ReclamacoesTable
        {...defaultProps}
        reclamacoes={[mockReclamacao]}
        onRowClick={mockOnRowClick}
      />
    );

    const row = screen.getByText("Descrição da reclamação").closest("tr");
    if (row) {
      await user.click(row);
      expect(mockOnRowClick).toHaveBeenCalledWith(mockReclamacao);
    }
  });

  it("deve exibir o status corretamente", () => {
    render(<ReclamacoesTable {...defaultProps} reclamacoes={[mockReclamacao]} />);

    expect(screen.getByText("Aberto")).toBeInTheDocument();
  });

  it("deve renderizar múltiplas reclamações", () => {
    const reclamacao2 = {
      ...mockReclamacao,
      id: "2",
      issue: "ISSUE-002",
      description: "Descrição 2",
      user: { ...mockReclamacao.user, name: "Maria Santos" },
      item: { ...mockReclamacao.item, name: "Item 2" },
    };
    const reclamacao3 = {
      ...mockReclamacao,
      id: "3",
      issue: "ISSUE-003",
      description: "Descrição 3",
      user: { ...mockReclamacao.user, name: "Pedro Costa" },
      item: { ...mockReclamacao.item, name: "Item 3" },
    };
    const reclamacoes = [mockReclamacao, reclamacao2, reclamacao3];

    render(<ReclamacoesTable {...defaultProps} reclamacoes={reclamacoes} />);

    expect(screen.getByText("Descrição da reclamação")).toBeInTheDocument();
    expect(screen.getByText("Descrição 2")).toBeInTheDocument();
    expect(screen.getByText("Descrição 3")).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("Pedro Costa")).toBeInTheDocument();
  });
});

