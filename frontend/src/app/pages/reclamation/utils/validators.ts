import type { ReclamacaoForm } from "./types";

export type ValidationErrors = Partial<Record<keyof ReclamacaoForm, string>>;

export const validateReclamacaoForm = (
  values: ReclamacaoForm
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!values.itemId) {
    errors.itemId = "Selecione o item";
  }

  if (!values.issue || values.issue.trim().length < 3) {
    errors.issue = "Informe o tipo de problema";
  }

  const descricaoTrimmed = values.descricao.trim();
  if (!values.descricao || descricaoTrimmed.length < 10) {
    errors.descricao = "Descreva o problema com pelo menos 10 caracteres";
  } else if (descricaoTrimmed.length > 200) {
    errors.descricao = "A descrição deve ter no máximo 200 caracteres";
  }

  return errors;
};

