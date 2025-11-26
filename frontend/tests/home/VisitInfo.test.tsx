import { render, screen } from "@testing-library/react";
import { VisitInfo } from "../../src/app/pages/home/components/VisitInfo";
import type { Visita } from "../../src/app/pages/home/utils/types";

const mockVisita: Visita = {
  id: "1",
  feedback_id: "feedback-1",
  date: new Date("2024-01-15T10:30:00"),
  duration: 60,
  confirmed: false,
  foremen: [
    {
      id: "foreman-1",
      name: "João Silva",
      cpf: "123.456.789-00",
      phone: "(11) 98765-4321",
      visitId: "1",
    },
    {
      id: "foreman-2",
      name: "Maria Santos",
      cpf: "987.654.321-00",
      phone: "(11) 91234-5678",
      visitId: "1",
    },
  ],
};

describe("VisitInfo", () => {
  it("deve renderizar o componente corretamente", () => {
    render(<VisitInfo visita={mockVisita} />);

    expect(screen.getByText("Informações da Visita")).toBeInTheDocument();
  });

  it("deve exibir a data e hora formatada", () => {
    render(<VisitInfo visita={mockVisita} />);

    expect(screen.getByText(/15\/01\/2024 às 10:30/)).toBeInTheDocument();
  });

  it("deve exibir a duração estimada", () => {
    render(<VisitInfo visita={mockVisita} />);

    expect(screen.getByText("60 minutos")).toBeInTheDocument();
  });

  it("deve exibir todos os encarregados", () => {
    render(<VisitInfo visita={mockVisita} />);

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
  });

  it("deve exibir os telefones dos encarregados", () => {
    render(<VisitInfo visita={mockVisita} />);

    expect(screen.getByText("(11) 98765-4321")).toBeInTheDocument();
    expect(screen.getByText("(11) 91234-5678")).toBeInTheDocument();
  });

  it("deve renderizar corretamente com um único encarregado", () => {
    const singleForemanVisita: Visita = {
      ...mockVisita,
      foremen: [mockVisita.foremen[0]],
    };

    render(<VisitInfo visita={singleForemanVisita} />);

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.queryByText("Maria Santos")).not.toBeInTheDocument();
  });

  it("deve renderizar corretamente sem encarregados", () => {
    const noForemanVisita: Visita = {
      ...mockVisita,
      foremen: [],
    };

    render(<VisitInfo visita={noForemanVisita} />);

    expect(screen.getByText("Informações da Visita")).toBeInTheDocument();
    expect(screen.getByText("60 minutos")).toBeInTheDocument();
  });
});
