interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 grid grid-cols-[auto_1fr_auto] items-center gap-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-700 px-4 py-3">
      <button
        className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-900 grid place-items-center cursor-pointer hover:bg-slate-800 transition-colors"
        onClick={onToggleSidebar}
        aria-label="Alternar sidebar"
      >
        <span className="w-[18px] h-0.5 bg-slate-100 relative block before:content-[''] before:absolute before:left-0 before:right-0 before:h-0.5 before:bg-slate-100 before:-top-1.5 after:content-[''] after:absolute after:left-0 after:right-0 after:h-0.5 after:bg-slate-100 after:top-1.5" />
      </button>
      <h1 className="text-lg sm:text-xl font-semibold tracking-wide m-0">
        Obralog
      </h1>
    </nav>
  );
}

