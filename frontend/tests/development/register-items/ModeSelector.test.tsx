import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModeSelector } from "../../../src/app/pages/development/[developmentId]/register-items/components/ModeSelector";

describe("ModeSelector (register-items)", () => {
  const defaultProps = {
    mode: "individual" as const,
    onModeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o componente corretamente", () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByText("Cadastro individual")).toBeInTheDocument();
    expect(screen.getByText("Importar Arquivo")).toBeInTheDocument();
  });

  it("deve aplicar classe ativa quando mode é 'individual'", () => {
    render(<ModeSelector {...defaultProps} mode="individual" />);

    const individualButton = screen.getByText("Cadastro individual");
    expect(individualButton).toHaveClass("bg-indigo-600");
  });

  it("deve aplicar classe ativa quando mode é 'file'", () => {
    render(<ModeSelector {...defaultProps} mode="file" />);

    const fileButton = screen.getByText("Importar Arquivo");
    expect(fileButton).toHaveClass("bg-indigo-600");
  });

  it("deve chamar onModeChange quando o botão individual é clicado", async () => {
    const mockOnModeChange = jest.fn();
    const user = userEvent.setup();
    render(
      <ModeSelector
        {...defaultProps}
        mode="file"
        onModeChange={mockOnModeChange}
      />
    );

    const individualButton = screen.getByText("Cadastro individual");
    await user.click(individualButton);

    expect(mockOnModeChange).toHaveBeenCalledWith("individual");
  });

  it("deve chamar onModeChange quando o botão file é clicado", async () => {
    const mockOnModeChange = jest.fn();
    const user = userEvent.setup();
    render(
      <ModeSelector
        {...defaultProps}
        mode="individual"
        onModeChange={mockOnModeChange}
      />
    );

    const fileButton = screen.getByText("Importar Arquivo");
    await user.click(fileButton);

    expect(mockOnModeChange).toHaveBeenCalledWith("file");
  });
});

