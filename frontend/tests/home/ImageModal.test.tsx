import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageModal } from "../../src/app/pages/home/components/ImageModal";

// Mock do Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, unoptimized, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe("ImageModal", () => {
  const defaultProps = {
    isOpen: false,
    imageUrl: null,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não deve renderizar quando isOpen é false", () => {
    const { container } = render(<ImageModal {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("não deve renderizar quando imageUrl é null", () => {
    const { container } = render(
      <ImageModal {...defaultProps} isOpen={true} imageUrl={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar quando isOpen é true e imageUrl está presente", () => {
    render(
      <ImageModal
        {...defaultProps}
        isOpen={true}
        imageUrl="https://example.com/image.jpg"
      />
    );

    expect(screen.getByAltText("Imagem em tela cheia")).toBeInTheDocument();
    expect(screen.getByLabelText("Fechar")).toBeInTheDocument();
  });

  it("deve chamar onClose quando o botão de fechar é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    render(
      <ImageModal
        {...defaultProps}
        isOpen={true}
        imageUrl="https://example.com/image.jpg"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText("Fechar");
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onClose quando o backdrop é clicado", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ImageModal
        {...defaultProps}
        isOpen={true}
        imageUrl="https://example.com/image.jpg"
        onClose={mockOnClose}
      />
    );

    const backdrop = container.querySelector(".fixed.inset-0") as HTMLElement;
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("não deve chamar onClose quando a imagem é clicada", async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    render(
      <ImageModal
        {...defaultProps}
        isOpen={true}
        imageUrl="https://example.com/image.jpg"
        onClose={mockOnClose}
      />
    );

    const image = screen.getByAltText("Imagem em tela cheia");
    await user.click(image);

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
