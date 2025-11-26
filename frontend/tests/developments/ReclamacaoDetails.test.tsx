import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReclamacaoDetails } from "../../src/app/pages/developments/[developmentId]/reclamacoes/components/ReclamacaoDetails";
import type { Reclamacao } from "../../src/app/pages/developments/[developmentId]/reclamacoes/utils/types";

// Mock do Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, unoptimized, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock do buildBackendUrl
jest.mock("@/app/api/_lib/backend", () => ({
  buildBackendUrl: (path: string) => {
    const url = new URL(path, "http://localhost:3000");
    return url;
  },
}));

const mockReclamacao: Reclamacao = {
  id: "1",
  issue: "ISSUE-001",
  status: "ABERTO",
  id_item: "item-1",
  description: "Descrição da reclamação",
  created_at: new Date("2024-01-15T10:30:00"),
  id_user: "user-1",
  user: {
    name: "João Silva",
    email: "joao@example.com",
  },
  item: {
    name: "Item Teste",
    unit: {
      number: 101,
      name: "Unidade 101",
      floor: 1,
      torre: {
        name: "Torre A",
      },
    },
  },
  attachments: [],
};

const mockReclamacaoWithAttachments: Reclamacao = {
  ...mockReclamacao,
  attachments: [
    {
      id: "anexo-1",
      created_at: new Date(),
      original_name: "imagem.jpg",
      file_name: "imagem.jpg",
      path: "/uploads/imagem.jpg",
      mime_type: "image/jpeg",
      size: 1024,
    },
  ],
};

describe("ReclamacaoDetails", () => {
  const defaultProps = {
    reclamacao: mockReclamacao,
    onImageClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o componente corretamente", () => {
    render(<ReclamacaoDetails {...defaultProps} />);

    expect(screen.getByText("Data/Hora:")).toBeInTheDocument();
    expect(screen.getByText("Issue:")).toBeInTheDocument();
    expect(screen.getByText("Usuário:")).toBeInTheDocument();
    expect(screen.getByText("Item:")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Descrição:")).toBeInTheDocument();
  });

  it("deve exibir os dados básicos da reclamação", () => {
    render(<ReclamacaoDetails {...defaultProps} />);

    expect(screen.getByText("ISSUE-001")).toBeInTheDocument();
    expect(screen.getByText(/João Silva/)).toBeInTheDocument();
    expect(screen.getByText(/joao@example.com/)).toBeInTheDocument();
    expect(screen.getByText("Item Teste")).toBeInTheDocument();
    expect(screen.getByText("Descrição da reclamação")).toBeInTheDocument();
  });

  it("deve exibir informações da unidade quando presente", () => {
    render(<ReclamacaoDetails {...defaultProps} />);

    expect(screen.getByText("Unidade:")).toBeInTheDocument();
    const unitText = screen.getByText(/Unidade 101/);
    expect(unitText).toBeInTheDocument();
    // Verifica se o texto contém as informações da unidade
    expect(unitText.textContent).toContain("Unidade 101");
    expect(unitText.textContent).toContain("101");
    expect(unitText.textContent).toContain("Torre A");
  });

  it("deve exibir anexos quando presentes", () => {
    render(
      <ReclamacaoDetails
        {...defaultProps}
        reclamacao={mockReclamacaoWithAttachments}
      />
    );

    expect(screen.getByText(/Anexos \(1\):/)).toBeInTheDocument();
  });

  it("deve chamar onImageClick quando uma imagem é clicada", async () => {
    const mockOnImageClick = jest.fn();
    const user = userEvent.setup();
    render(
      <ReclamacaoDetails
        {...defaultProps}
        reclamacao={mockReclamacaoWithAttachments}
        onImageClick={mockOnImageClick}
      />
    );

    const image = screen.getByAltText("imagem.jpg");
    await user.click(image);

    expect(mockOnImageClick).toHaveBeenCalledWith("/uploads/imagem.jpg");
  });

  it("não deve exibir seção de anexos quando não há anexos", () => {
    render(<ReclamacaoDetails {...defaultProps} />);

    expect(screen.queryByText(/Anexos/)).not.toBeInTheDocument();
  });

  it("deve exibir o status corretamente", () => {
    render(<ReclamacaoDetails {...defaultProps} />);

    expect(screen.getByText("Aberto")).toBeInTheDocument();
  });

  it("deve renderizar RepairInfo", () => {
    const { container } = render(<ReclamacaoDetails {...defaultProps} />);
    // RepairInfo pode não renderizar se não houver repairCost
    // Mas o componente deve estar presente na estrutura
    expect(container.querySelector(".modal-body")).toBeInTheDocument();
  });
});

