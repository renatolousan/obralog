import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectedInstallersList from "../../../src/app/pages/development/[developmentId]/register-items/components/selectedInstallersList";
import type { Installer } from "../../../src/app/pages/development/[developmentId]/register-items/utils/types";

const mockInstallers: Installer[] = [
  { id: "1", name: "Instalador 1", cpf: "123.456.789-00", phone: "12345467890" },
  { id: "2", name: "Instalador 2", cpf: "987.654.321-00", phone: "12345467890" },
];

describe("SelectedInstallersList", () => {
  const defaultProps = {
    installers: [],
    onRemove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve exibir mensagem quando não há instaladores", () => {
    render(<SelectedInstallersList {...defaultProps} />);

    expect(screen.getByText("Nenhum instalador selecionado")).toBeInTheDocument();
  });

  it("deve renderizar instaladores quando fornecidos", () => {
    render(<SelectedInstallersList {...defaultProps} installers={mockInstallers} />);

    expect(screen.getByText("Instalador 1")).toBeInTheDocument();
    expect(screen.getByText("Instalador 2")).toBeInTheDocument();
  });

  it("deve chamar onRemove quando o botão de remover é clicado", async () => {
    const mockOnRemove = jest.fn();
    const user = userEvent.setup();
    render(
      <SelectedInstallersList
        {...defaultProps}
        installers={mockInstallers}
        onRemove={mockOnRemove}
      />
    );

    const removeButtons = screen.getAllByRole("button");
    const firstRemoveButton = removeButtons.find((btn) =>
      btn.getAttribute("aria-label")?.includes("Instalador 1")
    );

    if (firstRemoveButton) {
      await user.click(firstRemoveButton);
      expect(mockOnRemove).toHaveBeenCalledWith("1");
    }
  });
});

