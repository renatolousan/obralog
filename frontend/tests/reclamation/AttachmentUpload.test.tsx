import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttachmentUpload } from "../../src/app/pages/reclamation/components/AttachmentUpload";

// Mock do Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock do URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");

describe("AttachmentUpload", () => {
  const mockOnFileSelect = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o componente com label", () => {
    render(
      <AttachmentUpload
        attachments={[]}
        onFileSelect={mockOnFileSelect}
        onRemove={mockOnRemove}
      />
    );
    expect(screen.getByText("Anexos (imagens JPEG/PNG)")).toBeInTheDocument();
  });

  it("deve renderizar a área de upload", () => {
    render(
      <AttachmentUpload
        attachments={[]}
        onFileSelect={mockOnFileSelect}
        onRemove={mockOnRemove}
      />
    );
    expect(
      screen.getByText("Clique para adicionar arquivos")
    ).toBeInTheDocument();
    expect(screen.getByText("ou arraste e solte aqui")).toBeInTheDocument();
  });

  it("deve chamar onFileSelect quando arquivos são selecionados", async () => {
    const user = userEvent.setup();
    const file = new File(["test"], "test.png", { type: "image/png" });

    render(
      <AttachmentUpload
        attachments={[]}
        onFileSelect={mockOnFileSelect}
        onRemove={mockOnRemove}
      />
    );

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(input).toBeInTheDocument();

    await user.upload(input, file);

    expect(mockOnFileSelect).toHaveBeenCalledTimes(1);
    expect(mockOnFileSelect).toHaveBeenCalledWith([file]);
  });

  it("não deve exibir lista de anexos quando não há anexos", () => {
    render(
      <AttachmentUpload
        attachments={[]}
        onFileSelect={mockOnFileSelect}
        onRemove={mockOnRemove}
      />
    );
    expect(screen.queryByText(/Anexos selecionados/)).not.toBeInTheDocument();
  });

  it("deve exibir lista de anexos quando há anexos", () => {
    const file1 = new File(["test1"], "test1.png", { type: "image/png" });
    const file2 = new File(["test2"], "test2.jpg", { type: "image/jpeg" });

    const attachments = [
      {
        id: "1",
        file: file1,
        previewUrl: "blob:mock-url-1",
      },
      {
        id: "2",
        file: file2,
        previewUrl: "blob:mock-url-2",
      },
    ];

    render(
      <AttachmentUpload
        attachments={attachments}
        onFileSelect={mockOnFileSelect}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText("Anexos selecionados (2)")).toBeInTheDocument();
    expect(screen.getByText("test1.png")).toBeInTheDocument();
    expect(screen.getByText("test2.jpg")).toBeInTheDocument();
  });

  it("deve chamar onRemove quando o botão de remover é clicado", async () => {
    const user = userEvent.setup();
    const file = new File(["test"], "test.png", { type: "image/png" });

    const attachments = [
      {
        id: "1",
        file: file,
        previewUrl: "blob:mock-url",
      },
    ];

    render(
      <AttachmentUpload
        attachments={attachments}
        onFileSelect={mockOnFileSelect}
        onRemove={mockOnRemove}
      />
    );

    const removeButton = screen.getByLabelText("Remover anexo");
    await user.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledWith("1");
  });

  it("deve aceitar múltiplos arquivos", async () => {
    const user = userEvent.setup();
    const file1 = new File(["test1"], "test1.png", { type: "image/png" });
    const file2 = new File(["test2"], "test2.png", { type: "image/png" });

    render(
      <AttachmentUpload
        attachments={[]}
        onFileSelect={mockOnFileSelect}
        onRemove={mockOnRemove}
      />
    );

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(input).toBeInTheDocument();

    await user.upload(input, [file1, file2]);

    expect(mockOnFileSelect).toHaveBeenCalledTimes(1);
    expect(mockOnFileSelect).toHaveBeenCalledWith([file1, file2]);
  });

  it("deve limpar o input após selecionar arquivos", async () => {
    const user = userEvent.setup();
    const file = new File(["test"], "test.png", { type: "image/png" });

    render(
      <AttachmentUpload
        attachments={[]}
        onFileSelect={mockOnFileSelect}
        onRemove={mockOnRemove}
      />
    );

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(input).toBeInTheDocument();

    await user.upload(input, file);

    // O input deve ser limpo após a seleção
    expect(input.value).toBe("");
  });
});
