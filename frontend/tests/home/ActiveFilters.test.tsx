import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActiveFilters } from "../../src/app/pages/home/components/ActiveFilters";

describe("ActiveFilters", () => {
  const defaultProps = {
    hasActiveFilters: false,
    appliedSearch: "",
    onClearSearch: jest.fn(),
    onClearAllFilters: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não deve renderizar quando não há filtros ativos nem busca aplicada", () => {
    const { container } = render(<ActiveFilters {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar quando há busca aplicada", () => {
    render(<ActiveFilters {...defaultProps} appliedSearch="teste" />);

    expect(screen.getByText(/Busca: teste/)).toBeInTheDocument();
  });

  it("deve renderizar quando há filtros ativos", () => {
    render(<ActiveFilters {...defaultProps} hasActiveFilters={true} />);

    expect(screen.getByText("Limpar filtros")).toBeInTheDocument();
  });

  it("deve chamar onClearSearch quando o botão de limpar busca é clicado", async () => {
    const mockOnClearSearch = jest.fn();
    const user = userEvent.setup();
    render(
      <ActiveFilters
        {...defaultProps}
        appliedSearch="teste"
        onClearSearch={mockOnClearSearch}
      />
    );

    const clearButton = screen.getByLabelText("Limpar busca");
    await user.click(clearButton);

    expect(mockOnClearSearch).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onClearAllFilters quando o botão Limpar filtros é clicado", async () => {
    const mockOnClearAllFilters = jest.fn();
    const user = userEvent.setup();
    render(
      <ActiveFilters
        {...defaultProps}
        hasActiveFilters={true}
        onClearAllFilters={mockOnClearAllFilters}
      />
    );

    const clearButton = screen.getByText("Limpar filtros");
    await user.click(clearButton);

    expect(mockOnClearAllFilters).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar ambos os elementos quando há busca e filtros ativos", () => {
    render(
      <ActiveFilters
        {...defaultProps}
        appliedSearch="teste"
        hasActiveFilters={true}
      />
    );

    expect(screen.getByText(/Busca: teste/)).toBeInTheDocument();
    expect(screen.getByText("Limpar filtros")).toBeInTheDocument();
  });
});
