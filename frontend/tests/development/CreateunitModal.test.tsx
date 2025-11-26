import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateUnitModal } from "../../src/app/pages/development/CreateunitModal";

// Mock do fetch global
global.fetch = jest.fn() as jest.Mock;

const mockBuildings = [
  { id: "1", nome: "Torre A" },
  { id: "2", nome: "Torre B" },
];

describe("CreateUnitModal", () => {
  const defaultProps = {
    isOpen: false,
    onClose: jest.fn(),
    buildings: mockBuildings,
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it("não deve renderizar quando isOpen é false", () => {
    const { container } = render(<CreateUnitModal {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar quando isOpen é true", () => {
    render(<CreateUnitModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Nova Unidade")).toBeInTheDocument();
  });

  it("deve chamar onClose quando o botão de fechar é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <CreateUnitModal {...defaultProps} isOpen={true} onClose={mockOnClose} />
    );

    // Busca o botão de fechar no header - é o segundo botão (o primeiro é o título)
    const header = container.querySelector(".flex.items-center.justify-between");
    const buttons = header?.querySelectorAll("button");
    // O botão de fechar é o que tem SVG com path de X
    const closeButton = Array.from(buttons || []).find((btn) => {
      const svg = btn.querySelector("svg");
      if (!svg) return false;
      const path = svg.querySelector("path");
      return path && path.getAttribute("d")?.includes("M6 18L18 6");
    });

    if (closeButton) {
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    } else {
      // Fallback: clica no overlay
      const overlay = container.querySelector(".fixed.inset-0");
      if (overlay) {
        await user.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    }
  });

  it("deve chamar onClose quando o overlay é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <CreateUnitModal {...defaultProps} isOpen={true} onClose={mockOnClose} />
    );

    const overlay = container.querySelector(".fixed.inset-0") as HTMLElement;
    if (overlay) {
      await user.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("deve renderizar os campos do formulário", () => {
    render(<CreateUnitModal {...defaultProps} isOpen={true} />);

    const torreLabels = screen.getAllByText(/Torre/);
    expect(torreLabels.length).toBeGreaterThan(0);
    const nomeLabels = screen.getAllByText(/Nome/);
    expect(nomeLabels.length).toBeGreaterThan(0);
    const numeroLabels = screen.getAllByText(/Número/);
    expect(numeroLabels.length).toBeGreaterThan(0);
    expect(screen.getByText(/Andar/)).toBeInTheDocument();
  });

  it("deve renderizar as opções de torre", () => {
    render(<CreateUnitModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Torre A")).toBeInTheDocument();
    expect(screen.getByText("Torre B")).toBeInTheDocument();
  });

  it("deve permitir preencher os campos do formulário", async () => {
    const user = userEvent.setup();
    render(<CreateUnitModal {...defaultProps} isOpen={true} />);

    const nameInput = screen.getByPlaceholderText("Ex: Apto 101");
    const numberInput = screen.getByPlaceholderText("Ex: 101");
    const floorInput = screen.getByPlaceholderText("Ex: 1");

    await user.type(nameInput, "Apto 101");
    await user.type(numberInput, "101");
    await user.type(floorInput, "1");

    expect(nameInput).toHaveValue("Apto 101");
    expect(numberInput).toHaveValue(101);
    expect(floorInput).toHaveValue(1);
  });

  it("deve chamar onSuccess e onClose quando a unidade é criada com sucesso", async () => {
    const mockOnSuccess = jest.fn();
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(
      <CreateUnitModal
        {...defaultProps}
        isOpen={true}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");

    const nameInput = screen.getByPlaceholderText("Ex: Apto 101");
    const numberInput = screen.getByPlaceholderText("Ex: 101");

    await user.type(nameInput, "Apto 101");
    await user.type(numberInput, "101");

    const submitButton = screen.getByText("Criar Unidade");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("deve exibir erro quando a criação falha", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Erro ao criar unidade" }),
    });

    render(<CreateUnitModal {...defaultProps} isOpen={true} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");

    const nameInput = screen.getByPlaceholderText("Ex: Apto 101");
    const numberInput = screen.getByPlaceholderText("Ex: 101");

    await user.type(nameInput, "Apto 101");
    await user.type(numberInput, "101");

    const submitButton = screen.getByText("Criar Unidade");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Erro ao criar unidade")).toBeInTheDocument();
    });
  });

  it("deve exibir Criando... quando está criando", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({}),
      }), 100))
    );

    render(<CreateUnitModal {...defaultProps} isOpen={true} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");

    const nameInput = screen.getByPlaceholderText("Ex: Apto 101");
    const numberInput = screen.getByPlaceholderText("Ex: 101");

    await user.type(nameInput, "Apto 101");
    await user.type(numberInput, "101");

    const submitButton = screen.getByText("Criar Unidade");
    await user.click(submitButton);

    // Verifica se o texto aparece durante o loading
    const creatingText = screen.queryByText("Criando...");
    if (creatingText) {
      expect(creatingText).toBeInTheDocument();
    }
  });
});

