"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-[#3739a2] border-b border-white/10 px-6 py-4 shadow-md backdrop-blur-md">
      
      <div className="flex items-center gap-4">
        
        <button
          className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors cursor-pointer"
          onClick={onToggleSidebar}
          aria-label="Alternar sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10">
            <Image
              src="/uploads/auth/logo.png"
              alt="Logo Obralog"
              fill
              className="object-contain" 
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white m-0 tracking-wide">
            Obralog
          </h1>
        </div>
      </div>

      <button
        className="px-4 py-2 rounded-lg border border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/20 transition-colors font-medium text-sm cursor-pointer"
        type="button"
        onClick={() => router.push("/pages/auth")}
      >
        Sair
      </button>
    </nav>
  );
}