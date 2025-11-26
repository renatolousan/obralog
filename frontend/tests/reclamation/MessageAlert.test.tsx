import { render, screen } from "@testing-library/react";
import { MessageAlert } from "../../src/app/pages/reclamation/components/MessageAlert";

describe("MessageAlert", () => {
  it("deve renderizar a mensagem de sucesso", () => {
    render(<MessageAlert message="Reclamação salva com sucesso!" />);
    expect(screen.getByText("Reclamação salva com sucesso!")).toBeInTheDocument();
  });

  it("deve renderizar a mensagem de erro", () => {
    render(<MessageAlert message="Erro ao salvar reclamação" type="error" />);
    expect(screen.getByText("Erro ao salvar reclamação")).toBeInTheDocument();
  });

  it("não deve renderizar quando a mensagem está vazia", () => {
    const { container } = render(<MessageAlert message="" />);
    expect(container.firstChild).toBeNull();
  });

  it("deve aplicar classes CSS corretas para tipo success", () => {
    const { container } = render(
      <MessageAlert message="Sucesso" type="success" />
    );
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain("bg-slate-950");
    expect(alert.className).toContain("border-slate-700");
  });

  it("deve aplicar classes CSS corretas para tipo error", () => {
    const { container } = render(
      <MessageAlert message="Erro" type="error" />
    );
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain("bg-slate-950");
    expect(alert.className).toContain("border-red-800");
    expect(alert.className).toContain("text-red-300");
  });
});

