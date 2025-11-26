import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivityModal } from "../../src/app/pages/home/components/ActivityModal";
import type { Atividade } from "../../src/app/pages/home/utils/types";
import type { FeedbackFormData } from "../../src/app/pages/home/hooks/useFeedbackForm";

// Mock do Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, unoptimized, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock do buildBackendUrl
jest.mock("@/lib/api", () => ({
  buildBackendUrl: (path: string) => `http://localhost:3000${path}`,
}));

const mockActivity: Atividade = {
  id: "1",
  data_hora: "2024-01-15 10:30:00",
  descricao: "Descrição da reclamação",
  issue: "ISSUE-001",
  id_item: "item-1",
  status: "ABERTO",
  status_codigo: "ABERTO",
};

const mockActivityVisitaAgendada: Atividade = {
  ...mockActivity,
  status: "VISITA_AGENDADA",
  status_codigo: "VISITA_AGENDADA",
  visita: {
    id: "visita-1",
    feedback_id: "feedback-1",
    date: new Date("2024-01-20T10:00:00"),
    duration: 60,
    confirmed: false,
    foremen: [
      {
        id: "foreman-1",
        name: "João Silva",
        cpf: "123.456.789-00",
        phone: "(11) 98765-4321",
        visitId: "visita-1",
      },
    ],
  },
};

const mockActivityAguardandoFeedback: Atividade = {
  ...mockActivity,
  status: "AGUARDANDO_FEEDBACK",
  status_codigo: "AGUARDANDO_FEEDBACK",
};

describe("ActivityModal", () => {
  const defaultFeedbackForm: FeedbackFormData = {
    liked: true,
    comment: "",
  };

  const defaultProps = {
    activity: mockActivity,
    isOpen: false,
    feedbackForm: defaultFeedbackForm,
    feedbackError: null,
    updatingStatus: false,
    onClose: jest.fn(),
    onImageClick: jest.fn(),
    onConfirmVisit: jest.fn(),
    onFeedbackFieldChange: jest.fn(),
    onSubmitFeedback: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não deve renderizar quando isOpen é false", () => {
    const { container } = render(<ActivityModal {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar quando isOpen é true", () => {
    render(<ActivityModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Detalhes da Reclamação")).toBeInTheDocument();
  });

  it("deve chamar onClose quando o botão de fechar é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    render(
      <ActivityModal {...defaultProps} isOpen={true} onClose={mockOnClose} />
    );

    const closeButton = screen.getByLabelText("Fechar");
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onClose quando o backdrop é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ActivityModal {...defaultProps} isOpen={true} onClose={mockOnClose} />
    );

    const backdrop = container.querySelector(".fixed.inset-0") as HTMLElement;
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("não deve chamar onClose quando o conteúdo do modal é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ActivityModal {...defaultProps} isOpen={true} onClose={mockOnClose} />
    );

    const modalContent = container.querySelector(
      ".bg-\\[\\#171a2b\\]"
    ) as HTMLElement;
    if (modalContent) {
      await user.click(modalContent);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it("deve exibir botão 'Confirmar Visita' quando status é VISITA_AGENDADA", () => {
    render(
      <ActivityModal
        {...defaultProps}
        isOpen={true}
        activity={mockActivityVisitaAgendada}
      />
    );

    expect(screen.getByText("Confirmar Visita")).toBeInTheDocument();
  });

  it("deve chamar onConfirmVisit quando o botão 'Confirmar Visita' é clicado", async () => {
    const mockOnConfirmVisit = jest.fn();
    const user = userEvent.setup();
    render(
      <ActivityModal
        {...defaultProps}
        isOpen={true}
        activity={mockActivityVisitaAgendada}
        onConfirmVisit={mockOnConfirmVisit}
      />
    );

    const confirmButton = screen.getByText("Confirmar Visita");
    await user.click(confirmButton);

    expect(mockOnConfirmVisit).toHaveBeenCalledTimes(1);
  });

  it("deve desabilitar o botão 'Confirmar Visita' quando updatingStatus é true", () => {
    render(
      <ActivityModal
        {...defaultProps}
        isOpen={true}
        activity={mockActivityVisitaAgendada}
        updatingStatus={true}
      />
    );

    const confirmButton = screen.getByText(
      "Confirmando..."
    ) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);
  });

  it("deve exibir FeedbackForm quando status é AGUARDANDO_FEEDBACK", () => {
    render(
      <ActivityModal
        {...defaultProps}
        isOpen={true}
        activity={mockActivityAguardandoFeedback}
      />
    );

    expect(screen.getByText("Feedback do Atendimento")).toBeInTheDocument();
  });

  it("deve exibir botão 'Fechar' quando status não é VISITA_AGENDADA nem AGUARDANDO_FEEDBACK", () => {
    render(<ActivityModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Fechar")).toBeInTheDocument();
  });

  it("deve exibir informações da visita quando status é VISITA_AGENDADA e visita está presente", () => {
    render(
      <ActivityModal
        {...defaultProps}
        isOpen={true}
        activity={mockActivityVisitaAgendada}
      />
    );

    expect(screen.getByText("Informações da Visita")).toBeInTheDocument();
  });

  it("deve exibir o status atual", () => {
    render(<ActivityModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Status atual")).toBeInTheDocument();
    const statusTexts = screen.getAllByText("Aberto");
    expect(statusTexts.length).toBeGreaterThan(0);
  });

  it("deve passar props corretas para ActivityDetails", () => {
    const mockOnImageClick = jest.fn();
    render(
      <ActivityModal
        {...defaultProps}
        isOpen={true}
        onImageClick={mockOnImageClick}
      />
    );

    expect(screen.getByText("ISSUE-001")).toBeInTheDocument();
  });
});
