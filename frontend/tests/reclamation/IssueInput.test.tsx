import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IssueInput } from "../../src/app/pages/reclamation/components/IssueInput";

describe("IssueInput", () => {
  const mockOnChange = jest.fn();
  const mockOnSuggest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o input com label", () => {
    render(
      <IssueInput
        value=""
        suggesting={false}
        canSuggest={true}
        onChange={mockOnChange}
        onSuggest={mockOnSuggest}
      />
    );
    expect(screen.getByText("Tipo de problema")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ex.: Instalação")).toBeInTheDocument();
  });

  it("deve chamar onChange quando o valor é alterado", async () => {
    const user = userEvent.setup();
    render(
      <IssueInput
        value=""
        suggesting={false}
        canSuggest={true}
        onChange={mockOnChange}
        onSuggest={mockOnSuggest}
      />
    );
    
    const input = screen.getByPlaceholderText("ex.: Instalação");
    await user.type(input, "Instalação");
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("deve exibir o botão de sugestão IA quando canSuggest é true", () => {
    render(
      <IssueInput
        value=""
        suggesting={false}
        canSuggest={true}
        onChange={mockOnChange}
        onSuggest={mockOnSuggest}
      />
    );
    expect(screen.getByText("🤖 IA")).toBeInTheDocument();
  });

  it("deve chamar onSuggest quando o botão IA é clicado", async () => {
    const user = userEvent.setup();
    render(
      <IssueInput
        value=""
        suggesting={false}
        canSuggest={true}
        onChange={mockOnChange}
        onSuggest={mockOnSuggest}
      />
    );
    
    const suggestButton = screen.getByText("🤖 IA");
    await user.click(suggestButton);
    
    expect(mockOnSuggest).toHaveBeenCalledTimes(1);
  });

  it("deve exibir '...' quando suggesting é true", () => {
    render(
      <IssueInput
        value=""
        suggesting={true}
        canSuggest={true}
        onChange={mockOnChange}
        onSuggest={mockOnSuggest}
      />
    );
    expect(screen.getByText("...")).toBeInTheDocument();
  });

  it("deve desabilitar o botão IA quando canSuggest é false", () => {
    render(
      <IssueInput
        value=""
        suggesting={false}
        canSuggest={false}
        onChange={mockOnChange}
        onSuggest={mockOnSuggest}
      />
    );
    const suggestButton = screen.getByText("🤖 IA");
    expect(suggestButton).toBeDisabled();
  });

  it("deve desabilitar o botão IA quando suggesting é true", () => {
    render(
      <IssueInput
        value=""
        suggesting={true}
        canSuggest={true}
        onChange={mockOnChange}
        onSuggest={mockOnSuggest}
      />
    );
    const suggestButton = screen.getByText("...");
    expect(suggestButton).toBeDisabled();
  });

  it("deve exibir erro quando fornecido", () => {
    render(
      <IssueInput
        value=""
        suggesting={false}
        canSuggest={true}
        error="Tipo de problema é obrigatório"
        onChange={mockOnChange}
        onSuggest={mockOnSuggest}
      />
    );
    expect(screen.getByText("Tipo de problema é obrigatório")).toBeInTheDocument();
  });

  it("deve aplicar classes CSS de erro quando há erro", () => {
    const { container } = render(
      <IssueInput
        value=""
        suggesting={false}
        canSuggest={true}
        error="Erro"
        onChange={mockOnChange}
        onSuggest={mockOnSuggest}
      />
    );
    const input = container.querySelector("input");
    expect(input?.className).toContain("border-red-800");
  });

  it("deve exibir o valor atual do input", () => {
    render(
      <IssueInput
        value="Instalação"
        suggesting={false}
        canSuggest={true}
        onChange={mockOnChange}
        onSuggest={mockOnSuggest}
      />
    );
    const input = screen.getByPlaceholderText("ex.: Instalação") as HTMLInputElement;
    expect(input.value).toBe("Instalação");
  });
});

