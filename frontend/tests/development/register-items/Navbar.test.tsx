import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { Navbar } from "../../../src/app/pages/development/[developmentId]/register-items/components/Navbar";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockBack = jest.fn();
const mockRouter = {
  back: mockBack,
  push: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

describe("Navbar (register-items)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("deve renderizar o componente corretamente", () => {
    render(<Navbar />);
    expect(screen.getByText("Voltar")).toBeInTheDocument();
  });

  it("deve chamar router.back quando o botão é clicado", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const backButton = screen.getByText("Voltar");
    await user.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});

