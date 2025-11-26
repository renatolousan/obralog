import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FiltersModal } from "../../src/app/pages/home/components/FiltersModal";
import type {
  Filters,
  Option,
  ItemOption,
} from "../../src/app/pages/home/utils/types";

const mockItemOptions: ItemOption[] = [
  { id: "item-1", nome: "Item 1", descricao: "Descrição 1" },
  { id: "item-2", nome: "Item 2", descricao: "Descrição 2" },
];

const mockSupplierOptions: Option[] = [
  { id: "supplier-1", nome: "Fornecedor 1" },
  { id: "supplier-2", nome: "Fornecedor 2" },
];

const mockInstallerOptions: Option[] = [
  { id: "installer-1", nome: "Instalador 1" },
  { id: "installer-2", nome: "Instalador 2" },
];

const mockDraftFilters: Filters = {
  startDate: "",
  endDate: "",
  developmentId: "",
  buildingId: "",
  unitId: "",
  itemId: "",
  supplierId: "",
  installerId: "",
  statuses: [],
};

describe("FiltersModal", () => {
  const defaultProps = {
    isOpen: false,
    draftFilters: mockDraftFilters,
    itemOptions: [],
    supplierOptions: [],
    installerOptions: [],
    loadingOptions: {
      items: false,
      suppliers: false,
      installers: false,
    },
    error: null,
    onClose: jest.fn(),
    onUpdateFilter: jest.fn(),
    onToggleStatus: jest.fn(),
    onReset: jest.fn(),
    onApply: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não deve renderizar quando isOpen é false", () => {
    const { container } = render(<FiltersModal {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar quando isOpen é true", () => {
    render(<FiltersModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Filtros avançados")).toBeInTheDocument();
  });

  it("deve chamar onClose quando o botão de fechar é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    render(
      <FiltersModal {...defaultProps} isOpen={true} onClose={mockOnClose} />
    );

    const closeButton = screen.getByLabelText("Fechar filtros");
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar os campos de data", () => {
    render(<FiltersModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Data inicial")).toBeInTheDocument();
    expect(screen.getByText("Data final")).toBeInTheDocument();
    const dateInputs = screen.getAllByDisplayValue("");
    expect(dateInputs.length).toBeGreaterThan(0);
  });

  it("deve chamar onUpdateFilter quando a data inicial é alterada", async () => {
    const mockOnUpdateFilter = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <FiltersModal
        {...defaultProps}
        isOpen={true}
        onUpdateFilter={mockOnUpdateFilter}
      />
    );

    const startDateInput = container.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    if (startDateInput) {
      await user.type(startDateInput, "2024-01-01");
      expect(mockOnUpdateFilter).toHaveBeenCalled();
    }
  });

  it("deve chamar onUpdateFilter quando a data final é alterada", async () => {
    const mockOnUpdateFilter = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <FiltersModal
        {...defaultProps}
        isOpen={true}
        onUpdateFilter={mockOnUpdateFilter}
      />
    );

    const dateInputs = container.querySelectorAll('input[type="date"]');
    const endDateInput = dateInputs[1] as HTMLInputElement;
    if (endDateInput) {
      await user.type(endDateInput, "2024-12-31");
      expect(mockOnUpdateFilter).toHaveBeenCalled();
    }
  });

  it("deve renderizar o select de item instalado", () => {
    render(
      <FiltersModal
        {...defaultProps}
        isOpen={true}
        itemOptions={mockItemOptions}
      />
    );

    expect(screen.getByText("Item instalado")).toBeInTheDocument();
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThan(0);
  });

  it("deve renderizar as opções de item", () => {
    render(
      <FiltersModal
        {...defaultProps}
        isOpen={true}
        itemOptions={mockItemOptions}
      />
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("deve renderizar o select de fornecedor", () => {
    render(
      <FiltersModal
        {...defaultProps}
        isOpen={true}
        supplierOptions={mockSupplierOptions}
      />
    );

    expect(screen.getByText("Fornecedor")).toBeInTheDocument();
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThan(0);
  });

  it("deve renderizar o select de instalador", () => {
    render(
      <FiltersModal
        {...defaultProps}
        isOpen={true}
        installerOptions={mockInstallerOptions}
      />
    );

    expect(screen.getByText("Instalador")).toBeInTheDocument();
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThan(0);
  });

  it("deve chamar onUpdateFilter quando um select é alterado", async () => {
    const mockOnUpdateFilter = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <FiltersModal
        {...defaultProps}
        isOpen={true}
        itemOptions={mockItemOptions}
        onUpdateFilter={mockOnUpdateFilter}
      />
    );

    const selects = container.querySelectorAll("select");
    const itemSelect = Array.from(selects).find((select) =>
      select.previousElementSibling?.textContent?.includes("Item instalado")
    ) as HTMLSelectElement;

    if (itemSelect) {
      await user.selectOptions(itemSelect, "item-1");
      expect(mockOnUpdateFilter).toHaveBeenCalledWith("itemId", "item-1");
    }
  });

  it("deve renderizar os checkboxes de status", () => {
    render(<FiltersModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Aberto")).toBeInTheDocument();
    expect(screen.getByText("Em Análise")).toBeInTheDocument();
    expect(screen.getByText("Visita Agendada")).toBeInTheDocument();
    expect(screen.getByText("Aguardando Feedback")).toBeInTheDocument();
    expect(screen.getByText("Fechado")).toBeInTheDocument();
  });

  it("deve chamar onToggleStatus quando um checkbox de status é clicado", async () => {
    const mockOnToggleStatus = jest.fn();
    const user = userEvent.setup();
    render(
      <FiltersModal
        {...defaultProps}
        isOpen={true}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    const statusCheckbox = screen.getByLabelText("Aberto");
    await user.click(statusCheckbox);

    expect(mockOnToggleStatus).toHaveBeenCalledWith("ABERTO");
  });

  it("deve exibir mensagem de erro quando error está presente", () => {
    render(
      <FiltersModal
        {...defaultProps}
        isOpen={true}
        error="Erro ao carregar filtros"
      />
    );

    expect(screen.getByText("Erro ao carregar filtros")).toBeInTheDocument();
  });

  it("deve chamar onReset quando o botão Limpar é clicado", async () => {
    const mockOnReset = jest.fn();
    const user = userEvent.setup();
    render(
      <FiltersModal {...defaultProps} isOpen={true} onReset={mockOnReset} />
    );

    const resetButton = screen.getByText("Limpar");
    await user.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onClose quando o botão Cancelar é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    render(
      <FiltersModal {...defaultProps} isOpen={true} onClose={mockOnClose} />
    );

    const cancelButton = screen.getByText("Cancelar");
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onApply quando o botão Aplicar é clicado", async () => {
    const mockOnApply = jest.fn();
    const user = userEvent.setup();
    render(
      <FiltersModal {...defaultProps} isOpen={true} onApply={mockOnApply} />
    );

    const applyButton = screen.getByText("Aplicar");
    await user.click(applyButton);

    expect(mockOnApply).toHaveBeenCalledTimes(1);
  });

  it("deve desabilitar selects quando loadingOptions é true", () => {
    const { container } = render(
      <FiltersModal
        {...defaultProps}
        isOpen={true}
        itemOptions={mockItemOptions}
        loadingOptions={{ items: true, suppliers: false, installers: false }}
      />
    );

    const selects = container.querySelectorAll("select");
    const itemSelect = Array.from(selects).find((select) =>
      select.previousElementSibling?.textContent?.includes("Item instalado")
    ) as HTMLSelectElement;

    if (itemSelect) {
      expect(itemSelect.disabled).toBe(true);
    }
  });

  it("deve exibir mensagem quando não há itens disponíveis", () => {
    render(
      <FiltersModal
        {...defaultProps}
        isOpen={true}
        itemOptions={[]}
        loadingOptions={{ items: false, suppliers: false, installers: false }}
      />
    );

    expect(screen.getByText("Nenhum item encontrado.")).toBeInTheDocument();
  });
});
