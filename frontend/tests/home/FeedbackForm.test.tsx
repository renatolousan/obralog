import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedbackForm } from "../../src/app/pages/home/components/FeedbackForm";
import type { FeedbackFormData } from "../../src/app/pages/home/hooks/useFeedbackForm";

describe("FeedbackForm", () => {
  const defaultFormData: FeedbackFormData = {
    liked: true,
    comment: "",
  };

  const defaultProps = {
    formData: defaultFormData,
    error: null,
    loading: false,
    onFieldChange: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o componente corretamente", () => {
    render(<FeedbackForm {...defaultProps} />);

    expect(screen.getByText("Feedback do Atendimento")).toBeInTheDocument();
    expect(screen.getByText("Gostou do atendimento?")).toBeInTheDocument();
    expect(screen.getByText("Enviar Feedback")).toBeInTheDocument();
  });

  it("deve exibir os radio buttons para liked", () => {
    render(<FeedbackForm {...defaultProps} />);

    const simRadio = screen.getByLabelText("Sim");
    const naoRadio = screen.getByLabelText("Não");

    expect(simRadio).toBeInTheDocument();
    expect(naoRadio).toBeInTheDocument();
  });

  it("deve marcar o radio 'Sim' quando liked é true", () => {
    render(
      <FeedbackForm
        {...defaultProps}
        formData={{ ...defaultFormData, liked: true }}
      />
    );

    const simRadio = screen.getByLabelText("Sim") as HTMLInputElement;
    const naoRadio = screen.getByLabelText("Não") as HTMLInputElement;

    expect(simRadio.checked).toBe(true);
    expect(naoRadio.checked).toBe(false);
  });

  it("deve marcar o radio 'Não' quando liked é false", () => {
    render(
      <FeedbackForm
        {...defaultProps}
        formData={{ ...defaultFormData, liked: false }}
      />
    );

    const simRadio = screen.getByLabelText("Sim") as HTMLInputElement;
    const naoRadio = screen.getByLabelText("Não") as HTMLInputElement;

    expect(simRadio.checked).toBe(false);
    expect(naoRadio.checked).toBe(true);
  });

  it("deve chamar onFieldChange quando o radio 'Sim' é clicado", async () => {
    const mockOnFieldChange = jest.fn();
    const user = userEvent.setup();
    render(
      <FeedbackForm
        {...defaultProps}
        formData={{ ...defaultFormData, liked: false }}
        onFieldChange={mockOnFieldChange}
      />
    );

    const simRadio = screen.getByLabelText("Sim");
    await user.click(simRadio);

    expect(mockOnFieldChange).toHaveBeenCalledWith("liked", true);
  });

  it("deve chamar onFieldChange quando o radio 'Não' é clicado", async () => {
    const mockOnFieldChange = jest.fn();
    const user = userEvent.setup();
    render(
      <FeedbackForm
        {...defaultProps}
        formData={{ ...defaultFormData, liked: true }}
        onFieldChange={mockOnFieldChange}
      />
    );

    const naoRadio = screen.getByLabelText("Não");
    await user.click(naoRadio);

    expect(mockOnFieldChange).toHaveBeenCalledWith("liked", false);
  });

  it("deve exibir o textarea de comentário", () => {
    render(<FeedbackForm {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(
      "Deixe seu comentário sobre o atendimento..."
    );
    expect(textarea).toBeInTheDocument();
  });

  it("deve exibir o valor do comentário no textarea", () => {
    render(
      <FeedbackForm
        {...defaultProps}
        formData={{ ...defaultFormData, comment: "Ótimo atendimento!" }}
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Deixe seu comentário sobre o atendimento..."
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("Ótimo atendimento!");
  });

  it("deve chamar onFieldChange quando o comentário é alterado", async () => {
    const mockOnFieldChange = jest.fn();
    const user = userEvent.setup();
    render(
      <FeedbackForm {...defaultProps} onFieldChange={mockOnFieldChange} />
    );

    const textarea = screen.getByPlaceholderText(
      "Deixe seu comentário sobre o atendimento..."
    );
    await user.type(textarea, "teste");

    expect(mockOnFieldChange).toHaveBeenCalled();
  });

  it("deve exibir mensagem de erro quando error está presente", () => {
    render(<FeedbackForm {...defaultProps} error="Erro ao enviar feedback" />);

    expect(screen.getByText("Erro ao enviar feedback")).toBeInTheDocument();
  });

  it("não deve exibir mensagem de erro quando error é null", () => {
    render(<FeedbackForm {...defaultProps} error={null} />);

    expect(screen.queryByText(/Erro/)).not.toBeInTheDocument();
  });

  it("deve chamar onSubmit quando o botão é clicado", async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();
    render(<FeedbackForm {...defaultProps} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText("Enviar Feedback");
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it("deve desabilitar o botão quando loading é true", () => {
    render(<FeedbackForm {...defaultProps} loading={true} />);

    const submitButton = screen.getByText("Enviando...") as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it("deve exibir 'Enviando...' quando loading é true", () => {
    render(<FeedbackForm {...defaultProps} loading={true} />);

    expect(screen.getByText("Enviando...")).toBeInTheDocument();
    expect(screen.queryByText("Enviar Feedback")).not.toBeInTheDocument();
  });
});
