import { render, screen } from "@testing-library/react";
import { MessageAlert } from "../../../src/app/pages/development/[developmentId]/register-items/components/MessageAlert";

describe("MessageAlert (register-items)", () => {
  it("não deve renderizar quando message está vazia", () => {
    const { container } = render(<MessageAlert message="" type="error" />);
    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar mensagem de erro", () => {
    render(<MessageAlert message="Erro ao processar" type="error" />);

    expect(screen.getByText("Erro ao processar")).toBeInTheDocument();
  });

  it("deve renderizar mensagem de sucesso", () => {
    render(<MessageAlert message="Sucesso!" type="success" />);

    expect(screen.getByText("Sucesso!")).toBeInTheDocument();
  });

  it("deve aplicar classes CSS corretas para erro", () => {
    const { container } = render(
      <MessageAlert message="Erro" type="error" />
    );
    const alert = container.querySelector("p");

    expect(alert).toHaveClass("bg-red-50");
    expect(alert).toHaveClass("border-red-200");
    expect(alert).toHaveClass("text-red-700");
  });

  it("deve aplicar classes CSS corretas para sucesso", () => {
    const { container } = render(
      <MessageAlert message="Sucesso" type="success" />
    );
    const alert = container.querySelector("p");

    expect(alert).toHaveClass("bg-green-50");
    expect(alert).toHaveClass("border-green-200");
    expect(alert).toHaveClass("text-green-700");
  });
});

