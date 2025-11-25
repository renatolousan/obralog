import { onlyDigits } from "./formatters";

export const isValidCPF = (cpfRaw: string) => {
  const cpf = onlyDigits(cpfRaw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const calcDV = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++)
      sum += parseInt(base[i], 10) * (factor - i);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const dv1 = calcDV(cpf.slice(0, 9), 10);
  const dv2 = calcDV(cpf.slice(0, 10), 11);
  return dv1 === parseInt(cpf[9], 10) && dv2 === parseInt(cpf[10], 10);
};

