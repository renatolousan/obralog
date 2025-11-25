import { useState } from "react";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  className = "",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-100">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className={`w-full px-4 py-3 pr-12 border rounded-lg text-base text-slate-100 outline-none transition-all bg-slate-950 focus:ring-2 disabled:bg-slate-950/50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          type="button"
          className="absolute right-3 bg-transparent border-none cursor-pointer text-xl text-slate-400 opacity-60 p-1 transition-all hover:opacity-100 hover:text-slate-100"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? "👁️" : "👁️‍🗨️"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1 mb-0">{error}</p>}
    </div>
  );
}

