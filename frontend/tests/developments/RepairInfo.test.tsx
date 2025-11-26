import { render, screen } from "@testing-library/react";
import { RepairInfo } from "../../src/app/pages/developments/[developmentId]/reclamacoes/components/RepairInfo";
import type { Reclamacao } from "../../src/app/pages/developments/[developmentId]/reclamacoes/utils/types";

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

const mockReclamacaoWithRepairCost: Reclamacao = {
  ...mockReclamacao,
  repairCost: 1250.5,
};

const mockReclamacaoWithRepairCostAndInstaller: Reclamacao = {
  ...mockReclamacaoWithRepairCost,
  installer: {
    id: "installer-1",
    name: "Instalador Teste",
    phone: "(11) 98765-4321",
  },
};

const mockReclamacaoWithCompletedAt: Reclamacao = {
  ...mockReclamacaoWithRepairCostAndInstaller,
  completedAt: new Date("2024-01-20T15:00:00"),
};

describe("RepairInfo", () => {
  it("não deve renderizar quando não há repairCost", () => {
    const { container } = render(<RepairInfo reclamacao={mockReclamacao} />);
    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar quando há repairCost", () => {
    render(<RepairInfo reclamacao={mockReclamacaoWithRepairCost} />);

    expect(screen.getByText("Informações de Reparo")).toBeInTheDocument();
    expect(screen.getByText("Custo do Reparo:")).toBeInTheDocument();
  });

  it("deve exibir o custo do reparo formatado", () => {
    render(<RepairInfo reclamacao={mockReclamacaoWithRepairCost} />);

    expect(screen.getByText(/1\.250,50/)).toBeInTheDocument();
  });

  it("deve exibir informações do instalador quando presente", () => {
    render(<RepairInfo reclamacao={mockReclamacaoWithRepairCostAndInstaller} />);

    expect(screen.getByText("Prestador de Serviço:")).toBeInTheDocument();
    expect(screen.getByText("Instalador Teste")).toBeInTheDocument();
    expect(screen.getByText("(11) 98765-4321")).toBeInTheDocument();
  });

  it("não deve exibir telefone do instalador quando não está presente", () => {
    const reclamacaoWithoutPhone: Reclamacao = {
      ...mockReclamacaoWithRepairCost,
      installer: {
        id: "installer-1",
        name: "Instalador Teste",
      },
    };

    render(<RepairInfo reclamacao={reclamacaoWithoutPhone} />);

    expect(screen.getByText("Instalador Teste")).toBeInTheDocument();
    expect(screen.queryByText(/\(11\)/)).not.toBeInTheDocument();
  });

  it("deve exibir data de conclusão quando presente", () => {
    render(<RepairInfo reclamacao={mockReclamacaoWithCompletedAt} />);

    expect(screen.getByText("Concluído em:")).toBeInTheDocument();
  });

  it("não deve exibir data de conclusão quando não está presente", () => {
    render(<RepairInfo reclamacao={mockReclamacaoWithRepairCostAndInstaller} />);

    expect(screen.queryByText("Concluído em:")).not.toBeInTheDocument();
  });
});

