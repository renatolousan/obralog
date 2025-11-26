import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VisitForm } from "../../src/app/pages/developments/[developmentId]/reclamacoes/components/VisitForm";
import type { VisitFormData } from "../../src/app/pages/developments/[developmentId]/reclamacoes/hooks/useVisitForm";
import type { InstallerOption } from "../../src/app/pages/developments/[developmentId]/reclamacoes/utils/types";

const mockInstallers: InstallerOption[] = [
  {
    id: "installer-1",
    name: "Instalador 1",
    phone: "(11) 98765-4321",
    cpf: "123.456.789-00",
  },
  {
    id: "installer-2",
    name: "Instalador 2",
    phone: "(11) 91234-5678",
    cpf: "987.654.321-00",
  },
];

const defaultFormData: VisitFormData = {
  date: "",
  time: "",
  duration: "60",
  foremen_id: [],
  repairCost: "",
  id_installer: "",
};

describe("VisitForm", () => {
  const defaultProps = {
    formData: defaultFormData,
    installers: [],
    loadingInstallers: false,
    error: null,
    updatingStatus: false,
    onFieldChange: jest.fn(),
    onToggleForeman: jest.fn(),
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o componente corretamente", () => {
    render(<VisitForm {...defaultProps} />);

    expect(screen.getByText("Agendar Visita")).toBeInTheDocument();
    expect(screen.getByLabelText("Data:")).toBeInTheDocument();
    expect(screen.getByLabelText("Hora:")).toBeInTheDocument();
    expect(screen.getByLabelText("Duração (minutos):")).toBeInTheDocument();
  });

  it("deve exibir os campos do formulário", () => {
    render(<VisitForm {...defaultProps} />);

    expect(screen.getByLabelText("Data:")).toBeInTheDocument();
    expect(screen.getByLabelText("Hora:")).toBeInTheDocument();
    expect(screen.getByLabelText("Duração (minutos):")).toBeInTheDocument();
    expect(screen.getByText("Encarregados:")).toBeInTheDocument();
    expect(screen.getByLabelText(/Custo do Reparo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prestador de Serviço Executante/)).toBeInTheDocument();
  });

  it("deve chamar onFieldChange quando a data é alterada", async () => {
    const mockOnFieldChange = jest.fn();
    const user = userEvent.setup();
    render(<VisitForm {...defaultProps} onFieldChange={mockOnFieldChange} />);

    const dateInput = screen.getByLabelText("Data:");
    await user.type(dateInput, "2024-01-20");

    expect(mockOnFieldChange).toHaveBeenCalled();
  });

  it("deve chamar onFieldChange quando a hora é alterada", async () => {
    const mockOnFieldChange = jest.fn();
    const user = userEvent.setup();
    render(<VisitForm {...defaultProps} onFieldChange={mockOnFieldChange} />);

    const timeInput = screen.getByLabelText("Hora:");
    await user.type(timeInput, "14:30");

    expect(mockOnFieldChange).toHaveBeenCalled();
  });

  it("deve chamar onFieldChange quando a duração é alterada", async () => {
    const mockOnFieldChange = jest.fn();
    const user = userEvent.setup();
    render(<VisitForm {...defaultProps} onFieldChange={mockOnFieldChange} />);

    const durationInput = screen.getByLabelText("Duração (minutos):");
    await user.clear(durationInput);
    await user.type(durationInput, "90");

    expect(mockOnFieldChange).toHaveBeenCalled();
  });

  it("deve exibir mensagem de carregamento quando loadingInstallers é true", () => {
    render(<VisitForm {...defaultProps} loadingInstallers={true} />);

    expect(screen.getByText("Carregando encarregados...")).toBeInTheDocument();
  });

  it("deve exibir mensagem quando não há encarregados", () => {
    render(<VisitForm {...defaultProps} installers={[]} loadingInstallers={false} />);

    expect(screen.getByText("Nenhum encarregado encontrado")).toBeInTheDocument();
  });

  it("deve renderizar os encarregados quando fornecidos", () => {
    render(<VisitForm {...defaultProps} installers={mockInstallers} />);

    expect(screen.getByText("Instalador 1 - (11) 98765-4321")).toBeInTheDocument();
    expect(screen.getByText("Instalador 2 - (11) 91234-5678")).toBeInTheDocument();
  });

  it("deve chamar onToggleForeman quando um checkbox de encarregado é clicado", async () => {
    const mockOnToggleForeman = jest.fn();
    const user = userEvent.setup();
    render(
      <VisitForm
        {...defaultProps}
        installers={mockInstallers}
        onToggleForeman={mockOnToggleForeman}
      />
    );

    const checkbox = screen.getByLabelText(/Instalador 1/);
    await user.click(checkbox);

    expect(mockOnToggleForeman).toHaveBeenCalledWith("installer-1");
  });

  it("deve marcar checkbox quando encarregado está selecionado", () => {
    const formDataWithForeman: VisitFormData = {
      ...defaultFormData,
      foremen_id: ["installer-1"],
    };

    render(
      <VisitForm
        {...defaultProps}
        formData={formDataWithForeman}
        installers={mockInstallers}
      />
    );

    const checkbox = screen.getByLabelText(/Instalador 1/) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it("deve chamar onFieldChange quando o custo do reparo é alterado", async () => {
    const mockOnFieldChange = jest.fn();
    const user = userEvent.setup();
    render(<VisitForm {...defaultProps} onFieldChange={mockOnFieldChange} />);

    const costInput = screen.getByLabelText(/Custo do Reparo/);
    await user.type(costInput, "1250.50");

    expect(mockOnFieldChange).toHaveBeenCalled();
  });

  it("deve chamar onFieldChange quando o prestador de serviço é alterado", async () => {
    const mockOnFieldChange = jest.fn();
    const user = userEvent.setup();
    render(
      <VisitForm
        {...defaultProps}
        installers={mockInstallers}
        onFieldChange={mockOnFieldChange}
      />
    );

    const select = screen.getByLabelText(/Prestador de Serviço Executante/);
    await user.selectOptions(select, "installer-1");

    expect(mockOnFieldChange).toHaveBeenCalledWith("id_installer", "installer-1");
  });

  it("deve exibir mensagem de erro quando error está presente", () => {
    render(<VisitForm {...defaultProps} error="Erro ao agendar visita" />);

    expect(screen.getByText("Erro ao agendar visita")).toBeInTheDocument();
  });

  it("deve chamar onSubmit quando o botão Agendar é clicado", async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();
    render(<VisitForm {...defaultProps} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText("Agendar");
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onCancel quando o botão Cancelar é clicado", async () => {
    const mockOnCancel = jest.fn();
    const user = userEvent.setup();
    render(<VisitForm {...defaultProps} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText("Cancelar");
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("deve desabilitar o botão quando updatingStatus é true", () => {
    render(<VisitForm {...defaultProps} updatingStatus={true} />);

    const submitButton = screen.getByText("Agendando...") as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it("deve exibir 'Agendando...' quando updatingStatus é true", () => {
    render(<VisitForm {...defaultProps} updatingStatus={true} />);

    expect(screen.getByText("Agendando...")).toBeInTheDocument();
    expect(screen.queryByText("Agendar")).not.toBeInTheDocument();
  });
});

