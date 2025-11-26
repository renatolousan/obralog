import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivitiesTable } from "../../src/app/pages/home/components/ActivitiesTable";
import type { Atividade } from "../../src/app/pages/home/utils/types";

const mockActivity: Atividade = {
  id: "1",
  data_hora: "2024-01-15 10:30:00",
  descricao: "Descrição da reclamação",
  issue: "ISSUE-001",
  id_item: "item-1",
  status: "ABERTO",
  status_codigo: "ABERTO",
};

const mockActivityLongDescription: Atividade = {
  ...mockActivity,
  id: "2",
  descricao: "A".repeat(100),
};

describe("ActivitiesTable", () => {
  const defaultProps = {
    activities: [],
    loading: false,
    total: 0,
    onRowClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o componente corretamente", () => {
    render(<ActivitiesTable {...defaultProps} />);

    expect(screen.getByText("Últimas reclamações")).toBeInTheDocument();
    expect(screen.getByText("0 resultado(s)")).toBeInTheDocument();
  });

  it("deve exibir mensagem de carregamento quando loading é true", () => {
    render(<ActivitiesTable {...defaultProps} loading={true} />);

    expect(screen.getByText("Carregando…")).toBeInTheDocument();
    expect(screen.getByText("Carregando reclamações…")).toBeInTheDocument();
  });

  it("deve exibir mensagem quando não há atividades", () => {
    render(<ActivitiesTable {...defaultProps} />);

    expect(
      screen.getByText("Nenhuma reclamação encontrada.")
    ).toBeInTheDocument();
  });

  it("deve renderizar atividades quando fornecidas", () => {
    render(
      <ActivitiesTable
        {...defaultProps}
        activities={[mockActivity]}
        total={1}
      />
    );

    expect(screen.getByText("ISSUE-001")).toBeInTheDocument();
    expect(screen.getByText("Descrição da reclamação")).toBeInTheDocument();
    expect(screen.getByText("2024-01-15 10:30:00")).toBeInTheDocument();
  });

  it("deve truncar descrições longas", () => {
    render(
      <ActivitiesTable
        {...defaultProps}
        activities={[mockActivityLongDescription]}
        total={1}
      />
    );

    const description = screen.getByText(/^A{80}\.\.\.$/);
    expect(description).toBeInTheDocument();
  });

  it("deve chamar onRowClick quando uma linha é clicada", async () => {
    const mockOnRowClick = jest.fn();
    const user = userEvent.setup();
    render(
      <ActivitiesTable
        {...defaultProps}
        activities={[mockActivity]}
        total={1}
        onRowClick={mockOnRowClick}
      />
    );

    const row = screen.getByText("ISSUE-001").closest("tr");
    if (row) {
      await user.click(row);
      expect(mockOnRowClick).toHaveBeenCalledWith(mockActivity);
    }
  });

  it("deve chamar onRowClick quando o botão issue é clicado", async () => {
    const mockOnRowClick = jest.fn();
    const user = userEvent.setup();
    render(
      <ActivitiesTable
        {...defaultProps}
        activities={[mockActivity]}
        total={1}
        onRowClick={mockOnRowClick}
      />
    );

    const issueButton = screen.getByText("ISSUE-001");
    await user.click(issueButton);

    expect(mockOnRowClick).toHaveBeenCalledWith(mockActivity);
  });

  it("deve exibir o total correto de resultados", () => {
    render(<ActivitiesTable {...defaultProps} total={5} />);

    expect(screen.getByText("5 resultado(s)")).toBeInTheDocument();
  });

  it("deve renderizar o status corretamente", () => {
    render(
      <ActivitiesTable
        {...defaultProps}
        activities={[mockActivity]}
        total={1}
      />
    );

    expect(screen.getByText("Aberto")).toBeInTheDocument();
  });

  it("deve renderizar múltiplas atividades", () => {
    const activities = [
      mockActivity,
      { ...mockActivity, id: "2", issue: "ISSUE-002" },
      { ...mockActivity, id: "3", issue: "ISSUE-003" },
    ];

    render(
      <ActivitiesTable {...defaultProps} activities={activities} total={3} />
    );

    expect(screen.getByText("ISSUE-001")).toBeInTheDocument();
    expect(screen.getByText("ISSUE-002")).toBeInTheDocument();
    expect(screen.getByText("ISSUE-003")).toBeInTheDocument();
  });
});
