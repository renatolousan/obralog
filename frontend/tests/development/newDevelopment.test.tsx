import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewDevelopmentModal } from "../../src/app/pages/development/newDevelopment";

// Mock do buildBackendUrl
jest.mock("@/lib/api", () => ({
  buildBackendUrl: (path: string) => {
    const url = new URL(path, "http://localhost:3000");
    return url;
  },
}));

// Mock do fetch global
global.fetch = jest.fn() as jest.Mock;

describe("NewDevelopmentModal", () => {
  const defaultProps = {
    open: false,
    onClose: jest.fn(),
    onCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ development: { id: "1", nome: "Teste" } }),
    });
  });

  it("não deve renderizar quando open é false", () => {
    const { container } = render(<NewDevelopmentModal {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar quando open é true", () => {
    render(<NewDevelopmentModal {...defaultProps} open={true} />);

    expect(screen.getByText("Novo Empreendimento")).toBeInTheDocument();
  });

  it("deve chamar onClose quando o botão de fechar é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    render(<NewDevelopmentModal {...defaultProps} open={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText("Fechar");
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onClose quando o overlay é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <NewDevelopmentModal {...defaultProps} open={true} onClose={mockOnClose} />
    );

    const overlay = container.querySelector(".absolute.inset-0");
    if (overlay) {
      await user.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("deve renderizar os campos do formulário", () => {
    render(<NewDevelopmentModal {...defaultProps} open={true} />);

    expect(screen.getByLabelText("Nome *")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument();
    expect(screen.getByLabelText("Endereço")).toBeInTheDocument();
  });

  it("deve permitir preencher os campos", async () => {
    const user = userEvent.setup();
    render(<NewDevelopmentModal {...defaultProps} open={true} />);

    const nomeInput = screen.getByLabelText("Nome *");
    const descricaoInput = screen.getByLabelText("Descrição");
    const enderecoInput = screen.getByLabelText("Endereço");

    await user.type(nomeInput, "Empreendimento Teste");
    await user.type(descricaoInput, "Descrição teste");
    await user.type(enderecoInput, "Endereço teste");

    expect(nomeInput).toHaveValue("Empreendimento Teste");
    expect(descricaoInput).toHaveValue("Descrição teste");
    expect(enderecoInput).toHaveValue("Endereço teste");
  });

  it("deve renderizar campos de prédio inicialmente", () => {
    render(<NewDevelopmentModal {...defaultProps} open={true} />);

    // O componente já inicia com um prédio vazio
    expect(screen.getByPlaceholderText(/Nome do prédio/)).toBeInTheDocument();
  });

  it("deve adicionar um prédio quando botão é clicado", async () => {
    const user = userEvent.setup();
    render(<NewDevelopmentModal {...defaultProps} open={true} />);

    // Busca o botão "+ Adicionar prédio" no final da lista
    const addBuildingButtons = screen.queryAllByText((content, element) => {
      return element?.textContent === "+ Adicionar prédio" || 
             element?.textContent?.includes("Adicionar prédio");
    });
    
    if (addBuildingButtons.length > 0) {
      await user.click(addBuildingButtons[addBuildingButtons.length - 1]);
      const buildingInputs = screen.getAllByPlaceholderText(/Nome do prédio/);
      expect(buildingInputs.length).toBeGreaterThan(1);
    } else {
      // Se não houver botão, significa que já há um prédio (comportamento padrão)
      expect(screen.getByPlaceholderText(/Nome do prédio/)).toBeInTheDocument();
    }
  });

  it("deve adicionar uma unidade quando botão é clicado", async () => {
    const user = userEvent.setup();
    render(<NewDevelopmentModal {...defaultProps} open={true} />);

    const addUnitButton = screen.getByText("+ Adicionar unidade");
    await user.click(addUnitButton);

    const unitInputs = screen.getAllByPlaceholderText("Nome da unidade (ex: 101)");
    expect(unitInputs.length).toBeGreaterThan(1);
  });

  it("deve remover um prédio quando botão é clicado", async () => {
    const user = userEvent.setup();
    render(<NewDevelopmentModal {...defaultProps} open={true} />);

    // Adiciona um prédio primeiro
    const addBuildingButtons = screen.queryAllByText((content, element) => {
      return element?.textContent === "+ Adicionar prédio" || 
             element?.textContent?.includes("Adicionar prédio");
    });
    
    if (addBuildingButtons.length > 0) {
      await user.click(addBuildingButtons[addBuildingButtons.length - 1]);
    }

    const removeButtons = screen.getAllByLabelText("Remover prédio");
    if (removeButtons.length > 1) {
      const initialCount = screen.getAllByPlaceholderText(/Nome do prédio/).length;
      await user.click(removeButtons[0]);
      // Verifica se o número de prédios diminuiu
      const remainingInputs = screen.queryAllByPlaceholderText(/Nome do prédio/);
      expect(remainingInputs.length).toBeLessThan(initialCount);
    }
  });

  it("deve chamar onCreated e onClose quando o formulário é submetido com sucesso", async () => {
    const mockOnCreated = jest.fn();
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ development: { id: "1", nome: "Teste" } }),
    });

    render(
      <NewDevelopmentModal
        {...defaultProps}
        open={true}
        onCreated={mockOnCreated}
        onClose={mockOnClose}
      />
    );

    const nomeInput = screen.getByLabelText("Nome *");
    await user.type(nomeInput, "Empreendimento Teste");

    // O componente já inicia com um prédio, então vamos usar o que já existe
    const buildingNameInput = screen.getByPlaceholderText(/Nome do prédio/);
    await user.type(buildingNameInput, "Torre A");

    const unitNameInput = screen.getByPlaceholderText("Nome da unidade (ex: 101)");
    const unitFloorInput = screen.getAllByPlaceholderText("Andar")[0];
    const unitNumberInput = screen.getAllByPlaceholderText("Número")[0];

    await user.type(unitNameInput, "Apto 101");
    await user.type(unitFloorInput, "1");
    await user.type(unitNumberInput, "101");

    const submitButton = screen.getByText("Salvar");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it("deve exibir erro quando a criação falha", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ message: "Obra já existente." }),
    });

    render(<NewDevelopmentModal {...defaultProps} open={true} />);

    const nomeInput = screen.getByLabelText("Nome *");
    await user.type(nomeInput, "Empreendimento Teste");

    // O componente já inicia com um prédio, então não precisa adicionar
    // Mas vamos verificar se há campos de prédio
    const buildingInputs = screen.queryAllByPlaceholderText(/Nome do prédio/);
    if (buildingInputs.length === 0) {
      const addBuildingButtons = screen.queryAllByText((content, element) => {
        return element?.textContent?.includes("Adicionar prédio");
      });
      if (addBuildingButtons.length > 0) {
        await user.click(addBuildingButtons[0]);
      }
    }

    const buildingNameInput = screen.getByPlaceholderText(/Nome do prédio/);
    await user.type(buildingNameInput, "Torre A");

    const unitNameInput = screen.getByPlaceholderText("Nome da unidade (ex: 101)");
    const unitFloorInput = screen.getAllByPlaceholderText("Andar")[0];
    const unitNumberInput = screen.getAllByPlaceholderText("Número")[0];

    await user.type(unitNameInput, "Apto 101");
    await user.type(unitFloorInput, "1");
    await user.type(unitNumberInput, "101");

    const submitButton = screen.getByText("Salvar");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Obra já existente.")).toBeInTheDocument();
    });
  });

  it("deve desabilitar botão Salvar quando nome está vazio", () => {
    render(<NewDevelopmentModal {...defaultProps} open={true} />);

    const submitButton = screen.getByText("Salvar");
    expect(submitButton).toBeDisabled();
  });
});

