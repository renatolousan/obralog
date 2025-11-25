import type { PasswordStrength } from "../utils/passwordStrength";

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
}

export function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  if (strength.strength === 0) return null;

  return (
    <div className="mt-2">
      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1">
        <div
          className="h-full transition-all duration-300 ease-out rounded-full"
          style={{
            width: `${(strength.strength / 4) * 100}%`,
            backgroundColor: strength.color,
          }}
        />
      </div>
      <span
        className="text-xs font-semibold"
        style={{ color: strength.color }}
      >
        {strength.label}
      </span>
    </div>
  );
}

