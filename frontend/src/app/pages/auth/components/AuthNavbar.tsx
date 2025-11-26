import type { Mode } from "../utils/schemas";
import Image from "next/image"; 

interface AuthNavbarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onReset: () => void;
}

export function AuthNavbar({ mode, onModeChange, onReset }: AuthNavbarProps) {
  const handleModeChange = (newMode: Mode) => {
    onModeChange(newMode);
    onReset();
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-[#3739a2] border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
      
      <div className="flex items-center gap-3">
        
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 "> 
          <Image 
            src="/uploads/auth/logo.png" 
            alt="Logo Obralog"
            fill
            className="object-contain"
          />
        </div>

        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-100 m-0">
          Obralog
        </h1>
      </div>

      <div className="flex gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => handleModeChange("login")}
          className={`flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 min-w-[80px] sm:min-w-[100px] rounded-lg text-sm sm:text-base transition-colors ${
            mode === "login"
              ? "bg-indigo-600 text-white border border-indigo-600"
              : "bg-transparent text-slate-200 border border-indigo-600 hover:bg-indigo-600/20"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("signup")}
          className={`flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 min-w-[80px] sm:min-w-[100px] rounded-lg text-sm sm:text-base transition-colors ${
            mode === "signup"
              ? "bg-indigo-600 text-white border border-indigo-600"
              : "bg-transparent text-slate-200 border border-indigo-600 hover:bg-indigo-600/20"
          }`}
        >
          Cadastro
        </button>
      </div>
    </nav>
  );
}