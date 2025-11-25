interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  return (
    <nav className="navbar">
      <button
        className="iconbtn"
        onClick={onToggleSidebar}
        aria-label="Alternar sidebar"
      >
        <span className="hamb" />
      </button>
      <h1 className="brand">Obralog</h1>
    </nav>
  );
}

