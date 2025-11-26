"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-[#3739a2] border-b border-white/10 px-6 py-4 shadow-md">
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 sm:w-10 sm:h-10">
          <Image
            src="/uploads/auth/logo.png"
            alt="Logo Obralog"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-white m-0">
          Obralog
        </h1>
      </div>

      <button
        className="px-4 py-2 rounded-lg border border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/20 transition-colors font-medium text-sm"
        type="button"
        onClick={() => router.back()}
      >
        Voltar
      </button>
    </nav>
  );
}