import { render, screen } from "@testing-library/react";
import { ReportItem } from "../../src/app/pages/development/ReportItem";

// Mock do buildBackendUrl
jest.mock("@/lib/api", () => ({
  buildBackendUrl: (path: string) => {
    const url = new URL(path, "http://localhost:3000");
    return url;
  },
}));

// Mock do fetch global
global.fetch = jest.fn() as jest.Mock;

// Mock do window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

describe("ReportItem", () => {
  const defaultProps = {
    title: "Relatório Teste",
    endpoint: "/api/reports/test",
    developmentId: undefined,
    haveInterval: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: new Headers(),
      blob: async () => new Blob(),
    });
  });

  it("deve renderizar o componente corretamente", () => {
    render(<ReportItem {...defaultProps} />);

    expect(screen.getByText("Relatório Teste")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("não deve exibir campos de intervalo quando haveInterval é false", () => {
    render(<ReportItem {...defaultProps} />);

    expect(screen.queryByText("Data Inicial")).not.toBeInTheDocument();
    expect(screen.queryByText("Data Final")).not.toBeInTheDocument();
  });

  it("deve exibir campos de intervalo quando haveInterval é true", () => {
    render(<ReportItem {...defaultProps} haveInterval={true} />);

    expect(screen.getByText("Data Inicial")).toBeInTheDocument();
    expect(screen.getByText("Data Final")).toBeInTheDocument();
  });

  it("deve renderizar campos de data quando haveInterval é true", () => {
    const { container } = render(<ReportItem {...defaultProps} haveInterval={true} />);

    expect(screen.getByText("Data Inicial")).toBeInTheDocument();
    expect(screen.getByText("Data Final")).toBeInTheDocument();
    
    const inputs = container.querySelectorAll('input[type="month"]');
    expect(inputs.length).toBe(2);
  });
});

