import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../src/app/pages/home/components/Sidebar";

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

    expect(screen.getByText("Histórico")).toBeInTheDocument();
    expect(screen.getByText("Configurações")).toBeInTheDocument();
    expect(screen.getByText("Sair")).toBeInTheDocument();
  });

  it("deve renderizar o componente quando isOpen é false", () => {
    render(<Sidebar isOpen={false} />);

    expect(screen.getByText("Histórico")).toBeInTheDocument();
    expect(screen.getByText("Configurações")).toBeInTheDocument();
    expect(screen.getByText("Sair")).toBeInTheDocument();
  });

  it("deve aplicar classes CSS corretas quando isOpen é true", () => {
    const { container } = render(<Sidebar isOpen={true} />);
    const aside = container.querySelector("aside");

    expect(aside).toHaveClass("translate-y-0");
    expect(aside).toHaveClass("opacity-100");
    expect(aside).toHaveClass("pointer-events-auto");
  });

  it("deve aplicar classes CSS corretas quando isOpen é false", () => {
    const { container } = render(<Sidebar isOpen={false} />);
    const aside = container.querySelector("aside");

    expect(aside).toHaveClass("translate-y-2");
    expect(aside).toHaveClass("opacity-0");
    expect(aside).toHaveClass("pointer-events-none");
  });

  it("deve renderizar os links de navegação", () => {
    render(<Sidebar isOpen={true} />);

    const historicoLink = screen.getByText("Histórico").closest("a");
    const configuracoesLink = screen.getByText("Configurações").closest("a");

    expect(historicoLink).toBeInTheDocument();
    expect(configuracoesLink).toBeInTheDocument();
  });

  it("deve renderizar os indicadores visuais (pontos) nos links", () => {
    const { container } = render(<Sidebar isOpen={true} />);

    const indicators = container.querySelectorAll("span.w-2.h-2.rounded-full");
    expect(indicators.length).toBeGreaterThan(0);
  });

  it("deve renderizar o botão de logout", () => {
    render(<Sidebar isOpen={true} />);

    const logoutButton = screen.getByText("Sair");
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute("type", "button");
  });

  it('deve chamar router.push com "/pages/auth" quando o botão Sair é clicado', () => {
    render(<Sidebar isOpen={true} />);

    const logoutButton = screen.getByText("Sair");
    logoutButton.click();

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/pages/auth");
  });

  it("deve ter a estrutura correta com nav e botão de logout", () => {
    const { container } = render(<Sidebar isOpen={true} />);

    const nav = container.querySelector("nav");
    const button = container.querySelector("button");

    expect(nav).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Sair");
  });

  it("deve aplicar classes de hover nos links", () => {
    const { container } = render(<Sidebar isOpen={true} />);

    const links = container.querySelectorAll("a");
    links.forEach((link) => {
      expect(link).toHaveClass("hover:bg-slate-950");
      expect(link).toHaveClass("hover:border-slate-700");
    });
  });

  it("deve aplicar classes de estilo no botão de logout", () => {
    render(<Sidebar isOpen={true} />);

    const logoutButton = screen.getByText("Sair");
    expect(logoutButton).toHaveClass("border-red-900/50");
    expect(logoutButton).toHaveClass("bg-red-950/50");
    expect(logoutButton).toHaveClass("text-red-200");
    expect(logoutButton).toHaveClass("hover:bg-red-900/30");
  });
});
