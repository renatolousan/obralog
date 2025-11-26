import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "../../src/app/pages/home/components/Navbar";

describe("Navbar", () => {
  it("deve renderizar o componente corretamente", () => {
    const mockToggle = jest.fn();
    render(<Navbar onToggleSidebar={mockToggle} />);

    expect(screen.getByText("Obralog")).toBeInTheDocument();
    expect(screen.getByLabelText("Alternar sidebar")).toBeInTheDocument();
  });

  it("deve chamar onToggleSidebar quando o botão é clicado", async () => {
    const mockToggle = jest.fn();
    const user = userEvent.setup();
    render(<Navbar onToggleSidebar={mockToggle} />);

    const toggleButton = screen.getByLabelText("Alternar sidebar");
    await user.click(toggleButton);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("deve ter a estrutura correta com nav e botão", () => {
    const mockToggle = jest.fn();
    const { container } = render(<Navbar onToggleSidebar={mockToggle} />);

    const nav = container.querySelector("nav");
    const button = container.querySelector("button");

    expect(nav).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it("deve aplicar classes CSS corretas", () => {
    const mockToggle = jest.fn();
    const { container } = render(<Navbar onToggleSidebar={mockToggle} />);

    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("sticky");
    expect(nav).toHaveClass("top-0");
    expect(nav).toHaveClass("z-50");
  });
});
