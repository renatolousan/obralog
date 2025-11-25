"use client";

import { useMemo, useState, FormEvent } from "react";
import { buildBackendUrl } from "@/lib/api";

type UnitForm = {
  name: string;
  floor: number | "";
  number: number | "";
};

type BuildingForm = { name: string; units: UnitForm[] };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (obj: unknown) => void;
};

// Utils
function getDuplicateUnitNumbers(allBuildings: BuildingForm[]) {
  const nums: number[] = [];
  for (const b of allBuildings) {
    for (const u of b.units) {
      const n = typeof u.number === "number" ? u.number : Number(u.number);
      if (Number.isFinite(n)) nums.push(n);
    }
  }
  const counts = nums.reduce<Map<number, number>>((m, n) => {
    m.set(n, (m.get(n) ?? 0) + 1);
    return m;
  }, new Map());

  return [...counts.entries()]
    .filter(([, c]) => c > 1)
    .map(([n]) => n)
    .sort((a, b) => a - b);
}

async function createDevelopment(payload: {
  nome: string;
  descricao?: string;
  endereco?: string;
  buildings: BuildingForm[];
}) {
  const cleanBuildings = payload.buildings
    .map((b) => ({
      name: (b.name ?? "").trim(),
      units: (b.units ?? []).map((u) => ({
        name: (u.name ?? "").trim(),
        floor: u.floor === "" ? NaN : Number(u.floor),
        number: u.number === "" ? NaN : Number(u.number),
      }))
      .filter(
        (u) =>
          u.name.length > 0 &&
          Number.isFinite(u.floor) &&
          Number.isFinite(u.number)
      ),
    }))
    .filter((b) => b.name.length > 0 && b.units.length > 0)
    .filter((b, i, arr) => arr.findIndex((x) => x.name === b.name) === i);

  const body = {
    name: (payload.nome ?? "").trim(),
    description: (payload.descricao ?? "").trim(),
    address: (payload.endereco ?? "").trim(),
    buildings: cleanBuildings,
  };

  const res = await fetch(buildBackendUrl("/api/developments"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(body),
  });

  let data: { development?: unknown; message?: string; error?: string } | null = null;
  try {
    data = await res.json();
  } catch {}

  if (res.status === 409) {
    throw new Error(data?.message || "Obra já existente.");
  }
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Erro ${res.status}`);
  }

  return data?.development ?? data;
}

export function NewDevelopmentModal({ open, onClose, onCreated }: Props) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [endereco, setEndereco] = useState("");

  const [buildings, setBuildings] = useState<BuildingForm[]>([
    { name: "", units: [{ name: "", floor: "", number: "" }] },
  ]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => nome.trim().length > 0, [nome]);

  // Conjunto de números usados para feedback visual
  const usedNumbers = useMemo(() => {
    return new Set(
      buildings.flatMap((b) =>
        b.units
          .map((u) => (typeof u.number === "number" ? u.number : Number(u.number)))
          .filter((n) => Number.isFinite(n))
      )
    );
  }, [buildings]);

  // prédios
  function setBuildingName(idx: number, value: string) {
    setBuildings((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, name: value } : b))
    );
  }
  function addBuilding() {
    setBuildings((prev) => [
      ...prev,
      { name: "", units: [{ name: "", floor: "", number: "" }] },
    ]);
  }
  function removeBuilding(idx: number) {
    setBuildings((prev) => prev.filter((_, i) => i !== idx));
  }

  // unidades
  function addUnit(bIdx: number) {
    setBuildings((prev) =>
      prev.map((b, i) =>
        i === bIdx
          ? {
              ...b,
              units: [
                ...b.units,
                { name: "", floor: "", number: "" },
              ],
            }
          : b
      )
    );
  }
  function removeUnit(bIdx: number, uIdx: number) {
    setBuildings((prev) =>
      prev.flatMap((b, i) => {
        if (i !== bIdx) return [b];
        const nextUnits = b.units.filter((_, j) => j !== uIdx);
        if (nextUnits.length === 0) return [];
        return [{ ...b, units: nextUnits }];
      })
    );
  }
  function setUnitField(
    bIdx: number,
    uIdx: number,
    field: keyof UnitForm,
    value: string
  ) {
    setBuildings((prev) =>
      prev.map((b, i) => {
        if (i !== bIdx) return b;
        const units = b.units.map((u, j) =>
          j === uIdx
            ? {
                ...u,
                [field]:
                  field === "name" ? value : value === "" ? "" : Number(value),
              }
            : u
        );
        return { ...b, units };
      })
    );
  }



  function validateBeforeSubmit() {
    // duplicidade global de Unit.number
    const dups = getDuplicateUnitNumbers(buildings);
    if (dups.length > 0) {
      return `Existem números de unidade duplicados (únicos globalmente): ${dups.join(
        ", "
      )}. Ajuste para prosseguir.`;
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    const validationMsg = validateBeforeSubmit();
    if (validationMsg) {
      setErr(validationMsg);
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const created = await createDevelopment({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        endereco: endereco.trim() || undefined,
        buildings,
      });
      onCreated?.(created);
      onClose();

      // reset
      setNome("");
      setDescricao("");
      setEndereco("");
      setBuildings([
        { name: "", units: [{ name: "", floor: "", number: "" }] },
      ]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setErr(message || "Falha ao criar empreendimento");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="novo-dev-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <header className="flex-shrink-0 flex items-start justify-between p-5 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 id="novo-dev-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Novo Empreendimento
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Fechar"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
              {err}
            </div>
          )}

          {/* Campos do Development */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="nome">
              Nome *
            </label>
            <input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-slate-300 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Ex.: Residencial Alpha"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="descricao">
              Descrição
            </label>
            <textarea
              id="descricao"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-slate-300 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Breve descrição do empreendimento"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="endereco">
              Endereço
            </label>
            <input
              id="endereco"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-slate-300 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Rua Exemplo, 123 — Bairro — Cidade/UF"
            />
          </div>

          {/* Prédios / Unidades / Itens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Prédios
              </label>
              {buildings.length === 0 && (
                <button
                  type="button"
                  onClick={addBuilding}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                  Adicionar prédio
                </button>
              )}
            </div>

            {buildings.length > 0 && (
              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                {buildings.map((b, bIdx) => (
                  <div key={bIdx} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    {/* Cabeçalho do prédio */}
                    <div className="flex items-center gap-2">
                      <input
                        value={b.name ?? ""}
                        onChange={(e) => setBuildingName(bIdx, e.target.value)}
                        onBlur={(e) => setBuildingName(bIdx, e.target.value.trim())}
                        placeholder={`Nome do prédio #${bIdx + 1}`}
                        required
                        maxLength={100}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent transition focus:border-slate-300 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeBuilding(bIdx)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                        aria-label="Remover prédio"
                        title="Remover"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Unidades */}
                    <div className="mt-3">
                      <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                        {b.units.map((u, uIdx) => {
                        const currentNumber =
                          typeof u.number === "number" ? u.number : Number(u.number);
                        const isDup =
                          Number.isFinite(currentNumber) &&
                          [...usedNumbers].filter((n) => n === currentNumber).length > 1;

                        return (
                          <div key={uIdx} className="grid grid-cols-12 items-center gap-2">
                            <input
                              className="col-span-5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                              placeholder="Nome da unidade (ex: 101)"
                              value={u.name ?? ""}
                              onChange={(e) => setUnitField(bIdx, uIdx, "name", e.target.value)}
                              onBlur={(e) => setUnitField(bIdx, uIdx, "name", e.target.value.trim())}
                              required
                            />
                            <input
                              className="col-span-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                              type="number"
                              inputMode="numeric"
                              placeholder="Andar"
                              value={u.floor}
                              onChange={(e) => setUnitField(bIdx, uIdx, "floor", e.target.value)}
                              required
                              min={0}
                            />
                            <input
                              className={
                                "col-span-3 rounded-xl px-3 py-2 text-sm outline-none " +
                                (isDup
                                  ? "border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950"
                                  : "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100")
                              }
                              type="number"
                              inputMode="numeric"
                              placeholder="Número"
                              value={u.number}
                              onChange={(e) => setUnitField(bIdx, uIdx, "number", e.target.value)}
                              required
                              min={0}
                              title={isDup ? "Número de unidade duplicado globalmente" : ""}
                            />
                            <button
                              type="button"
                              onClick={() => removeUnit(bIdx, uIdx)}
                              className="col-span-1 rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                              aria-label="Remover unidade"
                              title="Remover unidade"
                            >
                              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => addUnit(bIdx)}
                          className="text-sm text-slate-600 underline hover:text-slate-800 dark:text-slate-300"
                        >
                          + Adicionar unidade
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addBuilding}
                  className="text-sm text-slate-600 underline hover:text-slate-800 dark:text-slate-300"
                >
                  + Adicionar prédio
                </button>
              </div>
            )}
          </div>
          </div>

          <div className="flex-shrink-0 flex items-center justify-end gap-2 p-5 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" className="opacity-25" />
                  <path d="M12 3a9 9 0 019 9" className="opacity-75" />
                </svg>
              )}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
