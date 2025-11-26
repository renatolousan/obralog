import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportsModal } from "../../src/app/pages/development/reportsModal";

// Mock do ReportItem
jest.mock("../../src/app/pages/development/ReportItem", () => ({
  ReportItem: ({ title }: { title: string }) => <div>{title}</div>,
}));

// Mock do reports
jest.mock("../../src/app/pages/development/reports", () => ({
  availableReports: [
    { title: "Relatório Geral", endpoint: "/api/reports/general", isGeneral: true },
    { title: "Relatório Específico", endpoint: "/api/reports/specific", isGeneral: false },
  ],
}));

describe("ReportsModal", () => {
  const defaultProps = {
    open: false,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não deve renderizar quando open é false", () => {
    const { container } = render(<ReportsModal {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar quando open é true", () => {
    render(<ReportsModal {...defaultProps} open={true} />);

    expect(screen.getByText("Relatórios de obras")).toBeInTheDocument();
  });

  it("deve chamar onClose quando o botão de fechar é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    render(<ReportsModal {...defaultProps} open={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText("Fechar");
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onClose quando o overlay é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ReportsModal {...defaultProps} open={true} onClose={mockOnClose} />
    );

    const overlay = container.querySelector(".absolute.inset-0");
    if (overlay) {
      await user.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });


  it("deve exibir apenas relatórios gerais quando developmentId não é fornecido", () => {
    render(<ReportsModal {...defaultProps} open={true} />);

    expect(screen.getByText("Relatório Geral")).toBeInTheDocument();
    expect(screen.queryByText("Relatório Específico")).not.toBeInTheDocument();
  });

  it("deve exibir apenas relatórios específicos quando developmentId é fornecido", () => {
    render(<ReportsModal {...defaultProps} open={true} developmentId="123" />);

    expect(screen.getByText("Relatório Específico")).toBeInTheDocument();
    expect(screen.queryByText("Relatório Geral")).not.toBeInTheDocument();
  });

});

