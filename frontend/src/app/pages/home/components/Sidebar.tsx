import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const router = useRouter();

  return (
    <aside
      className={`bg-gradient-to-b from-[#171a2b] to-[#121326] border border-slate-700 rounded-2xl p-4 grid grid-rows-[auto_1fr_auto] min-h-[calc(100vh-96px)] shadow-xl overflow-hidden transition-all
        lg:static lg:translate-y-0
        ${
          isOpen
            ? "fixed inset-y-[72px] left-3 right-3 z-40 translate-y-0 opacity-100 pointer-events-auto lg:opacity-100 lg:pointer-events-auto"
            : "fixed inset-y-[72px] left-3 right-3 z-40 translate-y-2 opacity-0 pointer-events-none lg:opacity-0 lg:pointer-events-none lg:overflow-hidden"
        }
      `}
    >
      <nav className="flex flex-col gap-1.5">
        <a
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-100 no-underline border border-transparent hover:bg-slate-950 hover:border-slate-700 transition-colors"
          href="#"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_0_3px_rgba(124,150,255,0.15)]" />{" "}
          Histórico
        </a>
        <a
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-100 no-underline border border-transparent hover:bg-slate-950 hover:border-slate-700 transition-colors"
          href="#"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_0_3px_rgba(124,150,255,0.15)]" />{" "}
          Configurações
        </a>
      </nav>

      <div className="mt-3">
        <button
          className="w-full h-9 px-3.5 rounded-lg border border-red-900/50 bg-red-950/50 text-red-200 hover:bg-red-900/30 transition-colors font-medium"
          type="button"
          onClick={() => router.push("/pages/auth")}
        >
          Sair
        </button>
      </div>
    </aside>
  );
}

