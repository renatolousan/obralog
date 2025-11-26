import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../src/app/pages/developments/[developmentId]/reclamacoes/components/Sidebar";

// Mock do useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
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

describe("Sidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("deve renderizar o componente quando isOpen é true", () => {
    render(<Sidebar isOpen={true} />);

    expect(screen.getByText("Voltar para Obras")).toBeInTheDocument();
    expect(screen.getByText("Histórico")).toBeInTheDocument();
    expect(screen.getByText("Configurações")).toBeInTheDocument();
    expect(screen.getByText("Sair")).toBeInTheDocument();
  });

  it("deve renderizar o componente quando isOpen é false", () => {
    render(<Sidebar isOpen={false} />);

    expect(screen.getByText("Voltar para Obras")).toBeInTheDocument();
    expect(screen.getByText("Histórico")).toBeInTheDocument();
    expect(screen.getByText("Configurações")).toBeInTheDocument();
    expect(screen.getByText("Sair")).toBeInTheDocument();
  });

  it("deve aplicar classes CSS corretas quando isOpen é true", () => {
    const { container } = render(<Sidebar isOpen={true} />);
    const aside = container.querySelector("aside");

    expect(aside).toHaveClass("sidebar");
    expect(aside).toHaveClass("open");
  });

  it("deve aplicar classes CSS corretas quando isOpen é false", () => {
    const { container } = render(<Sidebar isOpen={false} />);
    const aside = container.querySelector("aside");

    expect(aside).toHaveClass("sidebar");
    expect(aside).not.toHaveClass("open");
  });

  it("deve chamar router.push com '/pages/development' quando o botão Voltar é clicado", async () => {
    const user = userEvent.setup();
    render(<Sidebar isOpen={true} />);

    const backButton = screen.getByText("Voltar para Obras");
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/pages/development");
  });

  it("deve chamar router.push com '/pages/auth' quando o botão Sair é clicado", async () => {
    const user = userEvent.setup();
    render(<Sidebar isOpen={true} />);

    const logoutButton = screen.getByText("Sair");
    await user.click(logoutButton);

    expect(mockPush).toHaveBeenCalledWith("/pages/auth");
  });

  it("deve renderizar os links de navegação", () => {
    render(<Sidebar isOpen={true} />);

    const historicoLink = screen.getByText("Histórico").closest("a");
    const configuracoesLink = screen.getByText("Configurações").closest("a");

    expect(historicoLink).toBeInTheDocument();
    expect(configuracoesLink).toBeInTheDocument();
  });
});

