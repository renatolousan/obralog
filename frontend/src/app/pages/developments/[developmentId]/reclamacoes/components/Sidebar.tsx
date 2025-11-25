import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const router = useRouter();

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <nav className="menu">
        <button
          className="item"
          onClick={() => router.push("/pages/development")}
        >
          <span className="dot" /> Voltar para Obras
        </button>
        <a className="item" href="#">
          <span className="dot" /> Histórico
        </a>
        <a className="item" href="#">
          <span className="dot" /> Configurações
        </a>
      </nav>

      <div className="sidebar-footer">
        <button
          className="btn danger full"
          type="button"
          onClick={() => router.push("/pages/auth")}
        >
          Sair
        </button>
      </div>
    </aside>
  );
}

