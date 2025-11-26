import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "../../src/app/pages/home/components/SearchBar";

describe("SearchBar", () => {
  const defaultProps = {
    searchTerm: "",
    appliedSearch: "",
    onSearchChange: jest.fn(),
    onSearchSubmit: jest.fn(),
    onClearSearch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o componente corretamente", () => {
    render(<SearchBar {...defaultProps} />);

    expect(screen.getByPlaceholderText("Buscar…")).toBeInTheDocument();
    expect(screen.getByText("Buscar")).toBeInTheDocument();
  });

  it("deve exibir o valor do searchTerm no input", () => {
    render(<SearchBar {...defaultProps} searchTerm="teste" />);

    const input = screen.getByPlaceholderText("Buscar…") as HTMLInputElement;
    expect(input.value).toBe("teste");
  });

  it("deve chamar onSearchChange quando o input é alterado", async () => {
    const mockOnSearchChange = jest.fn();
    const user = userEvent.setup();
    render(<SearchBar {...defaultProps} onSearchChange={mockOnSearchChange} />);

    const input = screen.getByPlaceholderText("Buscar…");
    await user.type(input, "teste");

    expect(mockOnSearchChange).toHaveBeenCalled();
  });

  it("deve chamar onSearchSubmit quando o formulário é submetido", async () => {
    const mockOnSearchSubmit = jest.fn((e) => e.preventDefault());
    const user = userEvent.setup();
    render(<SearchBar {...defaultProps} onSearchSubmit={mockOnSearchSubmit} />);

    const form = screen.getByPlaceholderText("Buscar…").closest("form");
    if (form) {
      await user.type(screen.getByPlaceholderText("Buscar…"), "teste");
      await user.click(screen.getByText("Buscar"));
    }

    expect(mockOnSearchSubmit).toHaveBeenCalled();
  });

  it("não deve exibir o botão Limpar quando não há appliedSearch", () => {
    render(<SearchBar {...defaultProps} appliedSearch="" />);

    expect(screen.queryByText("Limpar")).not.toBeInTheDocument();
  });

  it("deve exibir o botão Limpar quando há appliedSearch", () => {
    render(<SearchBar {...defaultProps} appliedSearch="teste" />);

    expect(screen.getByText("Limpar")).toBeInTheDocument();
  });

  it("deve chamar onClearSearch quando o botão Limpar é clicado", async () => {
    const mockOnClearSearch = jest.fn();
    const user = userEvent.setup();
    render(
      <SearchBar
        {...defaultProps}
        appliedSearch="teste"
        onClearSearch={mockOnClearSearch}
      />
    );

    const clearButton = screen.getByText("Limpar");
    await user.click(clearButton);

    expect(mockOnClearSearch).toHaveBeenCalledTimes(1);
  });
});
