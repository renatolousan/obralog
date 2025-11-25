export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export const validatePasswordChange = (
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): ValidationResult => {
  if (!oldPassword.trim()) {
    return { isValid: false, error: "Digite a senha atual" };
  }

  if (newPassword.length < 8) {
    return { isValid: false, error: "A nova senha deve ter no mínimo 8 caracteres" };
  }

  if (newPassword !== confirmPassword) {
    return { isValid: false, error: "As senhas não coincidem" };
  }

  if (newPassword === oldPassword) {
    return { isValid: false, error: "A nova senha deve ser diferente da senha atual" };
  }

  return { isValid: true };
};

export const checkPasswordRequirement = (password: string, requirement: string): boolean => {
  switch (requirement) {
    case "minLength":
      return password.length >= 8;
    case "uppercase":
      return /[A-Z]/.test(password);
    case "lowercase":
      return /[a-z]/.test(password);
    case "number":
      return /[0-9]/.test(password);
    default:
      return false;
  }
};

