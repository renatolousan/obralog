export const onlyDigits = (s: string) => s.replace(/\D+/g, "");

export const formatCPF = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);
  if (d.length > 9) return `${p1}.${p2}.${p3}-${p4}`;
  if (d.length > 6) return `${p1}.${p2}.${p3}`;
  if (d.length > 3) return `${p1}.${p2}`;
  return p1;
};

export const formatPhoneBR = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  const dd = d.slice(0, 2);
  const p1 = d.length > 10 ? d.slice(2, 7) : d.slice(2, 6);
  const p2 = d.length > 10 ? d.slice(7, 11) : d.slice(6, 10);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${dd}) ${d.slice(2)}`;
  return `(${dd}) ${p1}-${p2}`;
};

