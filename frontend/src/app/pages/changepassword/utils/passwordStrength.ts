export type PasswordStrength = {
  strength: number;
  label: string;
  color: string;
};

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (password.length === 0)
    return { strength: 0, label: "", color: "#64748b" };
  if (password.length < 8)
    return { strength: 1, label: "Muito fraca", color: "#ef4444" };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return { strength: 2, label: "Fraca", color: "#f59e0b" };
  if (strength <= 3) return { strength: 3, label: "Média", color: "#3b82f6" };
  return { strength: 4, label: "Forte", color: "#10b981" };
};

