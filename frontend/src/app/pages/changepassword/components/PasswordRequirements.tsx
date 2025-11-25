import { checkPasswordRequirement } from "../utils/validators";

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = [
    { key: "minLength", label: "Mínimo 8 caracteres" },
    { key: "uppercase", label: "Letra maiúscula" },
    { key: "lowercase", label: "Letra minúscula" },
    { key: "number", label: "Número" },
  ];

  return (
    <div className="bg-slate-950/60 border border-slate-700 rounded-lg p-4">
      <p className="text-sm font-semibold text-slate-100 m-0 mb-3">
        Requisitos da senha:
      </p>
      <ul className="list-none p-0 m-0 flex flex-col gap-2">
        {requirements.map((req) => {
          const isValid = checkPasswordRequirement(password, req.key);
          return (
            <li
              key={req.key}
              className={`text-sm flex items-center gap-2 ${
                isValid ? "text-green-400 font-medium" : "text-slate-400"
              }`}
            >
              {isValid ? "✅" : "⭕"} {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

