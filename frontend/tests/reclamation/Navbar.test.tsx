import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { Navbar } from "../../src/app/pages/reclamation/components/Navbar";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

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

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("deve renderizar o componente com o título", () => {
    render(<Navbar />);
    expect(screen.getByText("Nova Reclamação")).toBeInTheDocument();
  });

  it("deve chamar router.back quando o botão de voltar é clicado", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    
    const backButton = screen.getByLabelText("Voltar");
    await user.click(backButton);
    
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar o botão de voltar com aria-label", () => {
    render(<Navbar />);
    const backButton = screen.getByLabelText("Voltar");
    expect(backButton).toBeInTheDocument();
  });
});

