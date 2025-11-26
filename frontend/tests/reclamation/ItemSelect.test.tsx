import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItemSelect } from "../../src/app/pages/reclamation/components/ItemSelect";

const mockItems = [
  { id: "1", nome: "Item 1", descricao: "Descrição 1" },
  { id: "2", nome: "Item 2", descricao: "Descrição 2" },
  { id: "3", nome: "Item 3", descricao: null },
];

describe("ItemSelect", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o select com label", () => {
    render(
      <ItemSelect
        value=""
        items={mockItems}
        loading={false}
        onChange={mockOnChange}
      />
    );
    expect(screen.getByText("Item instalado")).toBeInTheDocument();
    expect(screen.getByText("Selecione o item")).toBeInTheDocument();
  });

  it("deve renderizar os itens disponíveis", () => {
    render(
      <ItemSelect
        value=""
        items={mockItems}
        loading={false}
        onChange={mockOnChange}
      />
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("deve chamar onChange quando um item é selecionado", async () => {
    const user = userEvent.setup();
    render(
      <ItemSelect
        value=""
        items={mockItems}
        loading={false}
        onChange={mockOnChange}
      />
    );
    
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");
    
    expect(mockOnChange).toHaveBeenCalledWith("1");
  });

  it("deve exibir mensagem de carregamento quando loading é true", () => {
    render(
      <ItemSelect
        value=""
        items={[]}
        loading={true}
        onChange={mockOnChange}
      />
    );
    expect(
      screen.getByText("Carregando itens da unidade…")
    ).toBeInTheDocument();
  });

  it("deve exibir mensagem quando não há itens e não está carregando", () => {
    render(
      <ItemSelect
        value=""
        items={[]}
        loading={false}
        onChange={mockOnChange}
      />
    );
    expect(
      screen.getByText("Nenhum item cadastrado para esta unidade.")
    ).toBeInTheDocument();
  });

  it("deve exibir erro quando fornecido", () => {
    render(
      <ItemSelect
        value=""
        items={mockItems}
        loading={false}
        error="Item é obrigatório"
        onChange={mockOnChange}
      />
    );
    expect(screen.getByText("Item é obrigatório")).toBeInTheDocument();
  });

  it("deve desabilitar o select quando disabled é true", () => {
    render(
      <ItemSelect
        value=""
        items={mockItems}
        loading={false}
        disabled={true}
        onChange={mockOnChange}
      />
    );
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });

  it("deve desabilitar o select quando não há itens", () => {
    render(
      <ItemSelect
        value=""
        items={[]}
        loading={false}
        onChange={mockOnChange}
      />
    );
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });

  it("deve aplicar classes CSS de erro quando há erro", () => {
    const { container } = render(
      <ItemSelect
        value=""
        items={mockItems}
        loading={false}
        error="Erro"
        onChange={mockOnChange}
      />
    );
    const select = container.querySelector("select");
    expect(select?.className).toContain("border-red-800");
  });
});

