import { render, screen } from "@testing-library/react";
import { PageHeader } from "../../src/app/pages/reclamation/components/PageHeader";

describe("PageHeader", () => {
  it("deve renderizar o título e descrição", () => {
    render(<PageHeader />);
    expect(screen.getByText("Nova reclamação")).toBeInTheDocument();
    expect(
      screen.getByText("Preencha os dados para registrar a ocorrência")
    ).toBeInTheDocument();
  });

  it("deve renderizar o campo de data/hora", () => {
    render(<PageHeader />);
    const dateInput = screen.getByDisplayValue(/202\d-\d{2}-\d{2}T\d{2}:\d{2}/) as HTMLInputElement;
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveAttribute("type", "datetime-local");
    expect(dateInput).toHaveAttribute("readOnly");
  });

  it("deve renderizar o campo de data/hora com valor", () => {
    render(<PageHeader />);
    const dateInput = screen.getByDisplayValue(/202\d-\d{2}-\d{2}T\d{2}:\d{2}/) as HTMLInputElement;
    expect(dateInput.value).toBeTruthy();
  });
});

