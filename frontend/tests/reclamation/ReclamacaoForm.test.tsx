import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { ReclamacaoFormComponent } from "../../src/app/pages/reclamation/components/ReclamacaoForm";
import type { ReclamacaoForm, ItemOption, AttachmentPreview } from "../../src/app/pages/reclamation/utils/types";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock do URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockRouter = {
  push: mockPush,
  back: mockBack,
  refresh: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
  replace: jest.fn(),
};

const mockItems: ItemOption[] = [
  { id: "1", nome: "Item 1", descricao: "Descrição 1" },
  { id: "2", nome: "Item 2", descricao: "Descrição 2" },
];

const initialValues: ReclamacaoForm = {
  itemId: "",
  issue: "",
  descricao: "",
  anexos: [],
};

describe("ReclamacaoFormComponent", () => {
  const mockOnFieldChange = jest.fn();
  const mockOnFileSelect = jest.fn();
  const mockOnRemoveAttachment = jest.fn();
  const mockOnSuggestIssue = jest.fn();
  const mockOnSubmit = jest.fn((e) => e.preventDefault());

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("deve renderizar todos os campos do formulário", () => {
    render(
      <ReclamacaoFormComponent
        values={initialValues}
        errors={{}}
        message=""
        submitting={false}
        items={mockItems}
        loadingItems={false}
        itemsError={null}
        attachments={[]}
        suggesting={false}
        aiError={null}
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("Item instalado")).toBeInTheDocument();
    expect(screen.getByText("Tipo de problema")).toBeInTheDocument();
    expect(screen.getByText("Descrição detalhada")).toBeInTheDocument();
    expect(screen.getByText("Anexos (imagens JPEG/PNG)")).toBeInTheDocument();
  });

  it("deve renderizar os botões de ação", () => {
    render(
      <ReclamacaoFormComponent
        values={initialValues}
        errors={{}}
        message=""
        submitting={false}
        items={mockItems}
        loadingItems={false}
        itemsError={null}
        attachments={[]}
        suggesting={false}
        aiError={null}
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Salvar")).toBeInTheDocument();
  });

  it("deve chamar onSubmit quando o formulário é submetido", async () => {
    const user = userEvent.setup();
    render(
      <ReclamacaoFormComponent
        values={initialValues}
        errors={{}}
        message=""
        submitting={false}
        items={mockItems}
        loadingItems={false}
        itemsError={null}
        attachments={[]}
        suggesting={false}
        aiError={null}
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByText("Salvar");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it("deve chamar router.back quando o botão Cancelar é clicado", async () => {
    const user = userEvent.setup();
    render(
      <ReclamacaoFormComponent
        values={initialValues}
        errors={{}}
        message=""
        submitting={false}
        items={mockItems}
        loadingItems={false}
        itemsError={null}
        attachments={[]}
        suggesting={false}
        aiError={null}
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByText("Cancelar");
    await user.click(cancelButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("deve exibir 'Salvando...' quando submitting é true", () => {
    render(
      <ReclamacaoFormComponent
        values={initialValues}
        errors={{}}
        message=""
        submitting={true}
        items={mockItems}
        loadingItems={false}
        itemsError={null}
        attachments={[]}
        suggesting={false}
        aiError={null}
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("Salvando...")).toBeInTheDocument();
  });

  it("deve desabilitar os botões quando submitting é true", () => {
    render(
      <ReclamacaoFormComponent
        values={initialValues}
        errors={{}}
        message=""
        submitting={true}
        items={mockItems}
        loadingItems={false}
        itemsError={null}
        attachments={[]}
        suggesting={false}
        aiError={null}
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByText("Cancelar");
    const submitButton = screen.getByText("Salvando...");

    expect(cancelButton).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("deve exibir mensagem de sucesso", () => {
    render(
      <ReclamacaoFormComponent
        values={initialValues}
        errors={{}}
        message="Reclamação salva com sucesso!"
        submitting={false}
        items={mockItems}
        loadingItems={false}
        itemsError={null}
        attachments={[]}
        suggesting={false}
        aiError={null}
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("Reclamação salva com sucesso!")).toBeInTheDocument();
  });

  it("deve exibir mensagem de erro", () => {
    render(
      <ReclamacaoFormComponent
        values={initialValues}
        errors={{}}
        message="Erro ao salvar reclamação"
        submitting={false}
        items={mockItems}
        loadingItems={false}
        itemsError={null}
        attachments={[]}
        suggesting={false}
        aiError={null}
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("Erro ao salvar reclamação")).toBeInTheDocument();
  });

  it("deve exibir itemsError quando fornecido", () => {
    render(
      <ReclamacaoFormComponent
        values={initialValues}
        errors={{}}
        message=""
        submitting={false}
        items={mockItems}
        loadingItems={false}
        itemsError="Erro ao carregar itens"
        attachments={[]}
        suggesting={false}
        aiError={null}
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("Erro ao carregar itens")).toBeInTheDocument();
  });

  it("deve exibir aiError quando fornecido", () => {
    render(
      <ReclamacaoFormComponent
        values={initialValues}
        errors={{}}
        message=""
        submitting={false}
        items={mockItems}
        loadingItems={false}
        itemsError={null}
        attachments={[]}
        suggesting={false}
        aiError="Erro ao gerar sugestão"
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("Erro ao gerar sugestão")).toBeInTheDocument();
  });

  it("deve passar os valores corretos para os componentes filhos", () => {
    const values: ReclamacaoForm = {
      itemId: "1",
      issue: "Instalação",
      descricao: "Descrição do problema",
      anexos: [],
    };

    render(
      <ReclamacaoFormComponent
        values={values}
        errors={{}}
        message=""
        submitting={false}
        items={mockItems}
        loadingItems={false}
        itemsError={null}
        attachments={[]}
        suggesting={false}
        aiError={null}
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    const issueInput = screen.getByPlaceholderText("ex.: Instalação") as HTMLInputElement;
    expect(issueInput.value).toBe("Instalação");

    const descriptionTextarea = screen.getByPlaceholderText(
      "Descreva o problema com o máximo de detalhes..."
    ) as HTMLTextAreaElement;
    expect(descriptionTextarea.value).toBe("Descrição do problema");
  });

  it("deve passar os erros corretos para os componentes filhos", () => {
    const errors = {
      itemId: "Item é obrigatório",
      issue: "Tipo de problema é obrigatório",
      descricao: "Descrição é obrigatória",
    };

    render(
      <ReclamacaoFormComponent
        values={initialValues}
        errors={errors}
        message=""
        submitting={false}
        items={mockItems}
        loadingItems={false}
        itemsError={null}
        attachments={[]}
        suggesting={false}
        aiError={null}
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("Item é obrigatório")).toBeInTheDocument();
    expect(screen.getByText("Tipo de problema é obrigatório")).toBeInTheDocument();
    expect(screen.getByText("Descrição é obrigatória")).toBeInTheDocument();
  });

  it("deve passar attachments para AttachmentUpload", () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    const attachments: AttachmentPreview[] = [
      {
        id: "1",
        file: file,
        previewUrl: "blob:mock-url",
      },
    ];

    render(
      <ReclamacaoFormComponent
        values={initialValues}
        errors={{}}
        message=""
        submitting={false}
        items={mockItems}
        loadingItems={false}
        itemsError={null}
        attachments={attachments}
        suggesting={false}
        aiError={null}
        canSuggest={true}
        onFieldChange={mockOnFieldChange}
        onFileSelect={mockOnFileSelect}
        onRemoveAttachment={mockOnRemoveAttachment}
        onSuggestIssue={mockOnSuggestIssue}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("Anexos selecionados (1)")).toBeInTheDocument();
    expect(screen.getByText("test.png")).toBeInTheDocument();
  });
});

