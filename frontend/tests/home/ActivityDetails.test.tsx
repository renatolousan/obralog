import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivityDetails } from "../../src/app/pages/home/components/ActivityDetails";
import type { Atividade } from "../../src/app/pages/home/utils/types";

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

const mockActivityWithItem: Atividade = {
  ...mockActivity,
  item: {
    id: "item-1",
    nome: "Item Teste",
    descricao: "Descrição do item",
    fornecedor: {
      id: "supplier-1",
      nome: "Fornecedor Teste",
    },
    instaladores: [
      {
        id: "installer-1",
        nome: "Instalador 1",
      },
      {
        id: "installer-2",
        nome: "Instalador 2",
      },
    ],
  },
};

const mockActivityWithUnit: Atividade = {
  ...mockActivity,
  unidade: {
    id: "unit-1",
    nome: "Unidade Teste",
    numero: 101,
    andar: 1,
  },
};

const mockActivityWithAttachments: Atividade = {
  ...mockActivity,
  anexos: [
    {
      id: "anexo-1",
      nome_original: "imagem.jpg",
      nome_arquivo: "imagem.jpg",
      caminho: "/uploads/imagem.jpg",
      tipo: "image/jpeg",
    },
  ],
};

describe("ActivityDetails", () => {
  const defaultProps = {
    activity: mockActivity,
    onImageClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o componente corretamente", () => {
    render(<ActivityDetails {...defaultProps} />);

    expect(screen.getByText("Data/Hora:")).toBeInTheDocument();
    expect(screen.getByText("Issue:")).toBeInTheDocument();
    expect(screen.getByText("ID do Item:")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Descrição:")).toBeInTheDocument();
  });

  it("deve exibir os dados básicos da atividade", () => {
    render(<ActivityDetails {...defaultProps} />);

    expect(screen.getByText("2024-01-15 10:30:00")).toBeInTheDocument();
    expect(screen.getByText("ISSUE-001")).toBeInTheDocument();
    expect(screen.getByText("item-1")).toBeInTheDocument();
    expect(screen.getByText("Descrição da reclamação")).toBeInTheDocument();
  });

  it("deve exibir informações do item quando presente", () => {
    render(
      <ActivityDetails {...defaultProps} activity={mockActivityWithItem} />
    );

    expect(screen.getByText("Item instalado:")).toBeInTheDocument();
    expect(screen.getByText("Item Teste")).toBeInTheDocument();
  });

  it("deve exibir informações do fornecedor quando presente", () => {
    render(
      <ActivityDetails {...defaultProps} activity={mockActivityWithItem} />
    );

    expect(screen.getByText("Fornecedor:")).toBeInTheDocument();
    expect(screen.getByText("Fornecedor Teste")).toBeInTheDocument();
  });

  it("deve exibir informações dos instaladores quando presentes", () => {
    render(
      <ActivityDetails {...defaultProps} activity={mockActivityWithItem} />
    );

    expect(screen.getByText("Instaladores:")).toBeInTheDocument();
    expect(screen.getByText("Instalador 1, Instalador 2")).toBeInTheDocument();
  });

  it("deve exibir informações da unidade quando presente", () => {
    render(
      <ActivityDetails {...defaultProps} activity={mockActivityWithUnit} />
    );

    expect(screen.getByText("Unidade:")).toBeInTheDocument();
    expect(screen.getByText(/Unidade Teste/)).toBeInTheDocument();
    expect(screen.getByText(/#101/)).toBeInTheDocument();
  });

  it("deve exibir anexos quando presentes", () => {
    render(
      <ActivityDetails
        {...defaultProps}
        activity={mockActivityWithAttachments}
      />
    );

    expect(screen.getByText(/Anexos \(1\):/)).toBeInTheDocument();
  });

  it("deve chamar onImageClick quando uma imagem é clicada", async () => {
    const mockOnImageClick = jest.fn();
    const user = userEvent.setup();
    render(
      <ActivityDetails
        {...defaultProps}
        activity={mockActivityWithAttachments}
        onImageClick={mockOnImageClick}
      />
    );

    const image = screen.getByAltText("imagem.jpg");
    await user.click(image);

    expect(mockOnImageClick).toHaveBeenCalledWith("/uploads/imagem.jpg");
  });

  it("não deve exibir seção de item quando item não está presente", () => {
    render(<ActivityDetails {...defaultProps} />);

    expect(screen.queryByText("Item instalado:")).not.toBeInTheDocument();
  });

  it("não deve exibir seção de unidade quando unidade não está presente", () => {
    render(<ActivityDetails {...defaultProps} />);

    expect(screen.queryByText("Unidade:")).not.toBeInTheDocument();
  });

  it("não deve exibir seção de anexos quando não há anexos", () => {
    render(<ActivityDetails {...defaultProps} />);

    expect(screen.queryByText(/Anexos/)).not.toBeInTheDocument();
  });

  it("deve exibir o status corretamente", () => {
    render(<ActivityDetails {...defaultProps} />);

    expect(screen.getByText("Aberto")).toBeInTheDocument();
  });
});
