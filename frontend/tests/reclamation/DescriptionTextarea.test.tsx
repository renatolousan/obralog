import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DescriptionTextarea } from "../../src/app/pages/reclamation/components/DescriptionTextarea";

describe("DescriptionTextarea", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o textarea com label", () => {
    render(
      <DescriptionTextarea value="" onChange={mockOnChange} />
    );
    expect(screen.getByText("Descrição detalhada")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Descreva o problema com o máximo de detalhes...")
    ).toBeInTheDocument();
  });

  it("deve chamar onChange quando o valor é alterado", async () => {
    const user = userEvent.setup();
    render(
      <DescriptionTextarea value="" onChange={mockOnChange} />
    );
    
    const textarea = screen.getByPlaceholderText(
      "Descreva o problema com o máximo de detalhes..."
    );
    await user.type(textarea, "Problema descrito");
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("deve exibir o contador de caracteres", () => {
    render(
      <DescriptionTextarea value="Teste" onChange={mockOnChange} />
    );
    expect(screen.getByText(/5\/200 caracteres/)).toBeInTheDocument();
  });

  it("deve exibir aviso quando o texto tem menos de 10 caracteres", () => {
    render(
      <DescriptionTextarea value="Curto" onChange={mockOnChange} />
    );
    expect(screen.getByText(/mínimo 10/)).toBeInTheDocument();
  });

  it("não deve exibir aviso quando o texto tem 10 ou mais caracteres", () => {
    render(
      <DescriptionTextarea value="Descrição com mais de 10 caracteres" onChange={mockOnChange} />
    );
    expect(screen.queryByText(/mínimo 10/)).not.toBeInTheDocument();
  });

  it("deve exibir erro quando fornecido", () => {
    render(
      <DescriptionTextarea
        value=""
        error="Descrição é obrigatória"
        onChange={mockOnChange}
      />
    );
    expect(screen.getByText("Descrição é obrigatória")).toBeInTheDocument();
  });

  it("deve aplicar classes CSS de erro quando há erro", () => {
    const { container } = render(
      <DescriptionTextarea
        value=""
        error="Erro"
        onChange={mockOnChange}
      />
    );
    const textarea = container.querySelector("textarea");
    expect(textarea?.className).toContain("border-red-800");
  });

  it("deve exibir o valor atual do textarea", () => {
    render(
      <DescriptionTextarea value="Descrição atual" onChange={mockOnChange} />
    );
    const textarea = screen.getByPlaceholderText(
      "Descreva o problema com o máximo de detalhes..."
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("Descrição atual");
  });

  it("deve ter maxLength de 200 caracteres", () => {
    render(
      <DescriptionTextarea value="" onChange={mockOnChange} />
    );
    const textarea = screen.getByPlaceholderText(
      "Descreva o problema com o máximo de detalhes..."
    ) as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(200);
  });

  it("deve calcular corretamente o contador removendo espaços em branco", () => {
    render(
      <DescriptionTextarea value="  Teste  " onChange={mockOnChange} />
    );
    expect(screen.getByText(/5\/200 caracteres/)).toBeInTheDocument();
  });
});

