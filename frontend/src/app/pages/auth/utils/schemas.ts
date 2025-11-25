import { z } from "zod";
import { onlyDigits } from "./formatters";
import { isValidCPF } from "./validators";

export const signupSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome completo"),
  cpf: z
    .string()
    .min(11, "CPF é obrigatório")
    .refine(isValidCPF, "CPF inválido"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  phone: z
    .string()
    .min(10, "Telefone é obrigatório")
    .refine((v) => {
      const d = onlyDigits(v);
      return d.length === 10 || d.length === 11;
    }, "Telefone deve ter 10 ou 11 dígitos"),
});

export const loginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type Mode = "signup" | "login";

export type FormData = {
  fullName?: string;
  cpf?: string;
  email: string;
  phone?: string;
  password?: string;
};

