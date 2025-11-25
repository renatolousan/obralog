"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./index.css";

/* =============================
   Config / Tipos
============================= */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const OWNERS_ENDPOINT = "/api/users/register"; // ajuste se seu backend usar outro caminho (ex.: "/api/proprietarios")

type Option = { id: string; nome: string };
type UnitOption = Option & { numero?: number | null };

type FormData = {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  developmentId: string;
  buildingId: string;
  unitId: string;
};

type ApiListResponse<T> = { data?: T; message?: string };

/* =============================
   Utils
============================= */
async function fetchJson<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    cache: "no-store",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const payload = (await res
    .json()
    .catch(() => null)) as ApiListResponse<T> | null;
  if (!res.ok) throw new Error(payload?.message ?? `Erro ${res.status}`);
  return (payload?.data ?? payload) as T;
}

const onlyDigits = (s: string) => s.replace(/\D+/g, "");

function maskCPF(s: string) {
  const d = onlyDigits(s).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function maskPhoneBR(s: string) {
  const d = onlyDigits(s).slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
function isValidCPF(cpf: string) {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  const dv = (base: string, f: number) => {
    let s = 0;
    for (let i = 0; i < base.length; i++) s += parseInt(base[i]) * (f - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return (
    dv(d.slice(0, 9), 10) === parseInt(d[9]) &&
    dv(d.slice(0, 10), 11) === parseInt(d[10])
  );
}
function isValidPhoneBR(phone: string) {
  const n = onlyDigits(phone);
  return n.length === 10 || n.length === 11;
}

/* =============================
   Página
============================= */
export default function RegisterResidentPage() {
  // dados dos selects
  const [developments, setDevelopments] = useState<Option[]>([]);
  const [buildings, setBuildings] = useState<Option[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);

  // loadings/erros
  const [loadingDevelopments, setLoadingDevelopments] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // form
  const [data, setData] = useState<FormData>({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    developmentId: "",
    buildingId: "",
    unitId: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    name: false,
    cpf: false,
    email: false,
    phone: false,
    developmentId: false,
    buildingId: false,
    unitId: false,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const markTouched = <K extends keyof FormData>(key: K) =>
    setTouched((t) => ({ ...t, [key]: true }));

  // validações
  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!data.name.trim()) e.name = "Informe o nome completo";
    if (!isValidCPF(data.cpf)) e.cpf = "CPF inválido";
    if (!isValidEmail(data.email)) e.email = "E-mail inválido";
    if (!isValidPhoneBR(data.phone)) e.phone = "Telefone inválido";
    if (!data.developmentId) e.developmentId = "Selecione a obra";
    if (!data.buildingId) e.buildingId = "Selecione a torre";
    if (!data.unitId) e.unitId = "Selecione a unidade";
    return e;
  }, [data]);
  const showErr = (k: keyof FormData) =>
    (submitted || touched[k]) && !!errors[k];
  const formIsValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  /* ============ Carregar Obras ============ */
  const loadDevelopments = useCallback(async () => {
    try {
      setLoadingDevelopments(true);
      setFetchError(null);
      const list = await fetchJson<Option[]>("/api/developments");
      setDevelopments(list ?? []);
    } catch (err) {
      setFetchError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as obras"
      );
    } finally {
      setLoadingDevelopments(false);
    }
  }, []);
  useEffect(() => {
    void loadDevelopments();
  }, [loadDevelopments]);

  /* ============ Handlers em cascata ============ */
  async function handleDevelopmentChange(id: string) {
    setData((p) => ({ ...p, developmentId: id, buildingId: "", unitId: "" }));
    setBuildings([]);
    setUnits([]);
    setFetchError(null);
    if (!id) return;
    try {
      setLoadingBuildings(true);
      const list = await fetchJson<Option[]>(
        `/api/developments/${id}/buildings`
      );
      setBuildings(list ?? []);
    } catch (err) {
      setFetchError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as torres"
      );
    } finally {
      setLoadingBuildings(false);
    }
  }

  async function handleBuildingChange(id: string) {
    setData((p) => ({ ...p, buildingId: id, unitId: "" }));
    setUnits([]);
    setFetchError(null);
    if (!id) return;
    try {
      setLoadingUnits(true);
      const list = await fetchJson<UnitOption[]>(`/api/buildings/${id}/units`);
      setUnits(list ?? []);
    } catch (err) {
      setFetchError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as unidades"
      );
    } finally {
      setLoadingUnits(false);
    }
  }

  function handleUnitChange(id: string) {
    setData((p) => ({ ...p, unitId: id }));
  }

  /* ============ Submit ============ */
  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitted(true);
    setSuccessMsg(null);
    setApiError(null);

    if (!formIsValid) {
      const order: (keyof FormData)[] = [
        "name",
        "cpf",
        "email",
        "phone",
        "developmentId",
        "buildingId",
        "unitId",
      ];
      const first = order.find((k) => !!errors[k]);
      if (first) {
        markTouched(first);
        const el = document.querySelector<HTMLElement>(
          `[data-field="${first}"]`
        );
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      setSubmitLoading(true);

      // monte o payload conforme seu backend espera:
      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        cpf: onlyDigits(data.cpf),
        phone: onlyDigits(data.phone),
        userType: "6e503925-8456-4e76-8e42-c80b0abee6fc",
        unitId: data.unitId,
      };

      const res = await fetch(`${API_BASE}${OWNERS_ENDPOINT}`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!res.ok)
        throw new Error(json?.message ?? `Falha ao cadastrar (${res.status})`);

      setSuccessMsg(json?.message ?? "Cadastro realizado com sucesso!");
      setData({
        name: "",
        cpf: "",
        email: "",
        phone: "",
        developmentId: "",
        buildingId: "",
        unitId: "",
      });
      setSubmitted(false);
      setTouched({
        name: false,
        cpf: false,
        email: false,
        phone: false,
        developmentId: false,
        buildingId: false,
        unitId: false,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("Erro inesperado");
      }
    } finally {
      setSubmitLoading(false);
    }
  }

  /* ============ UI ============ */
  return (
    <div className="bgCustom">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">Cadastrar novo morador</h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          Preencha os dados e associe à unidade (Obra → Torre → Unidade).
        </p>

        <form onSubmit={handleSubmit} className="form">
          {/* Dados pessoais */}
          <div className="grid grid2">
            <div className="span2">
              <label className="label">Nome completo</label>
              <input
                data-field="name"
                className={`input ${showErr("name") ? "error" : ""}`}
                placeholder="Ex.: Maria Silva"
                value={data.name}
                onChange={(e) =>
                  setData((p) => ({ ...p, name: e.target.value }))
                }
                onBlur={() => markTouched("name")}
              />
              {showErr("name") && <p className="helpError">{errors.name}</p>}
            </div>

            <div>
              <label className="label">CPF</label>
              <input
                data-field="cpf"
                inputMode="numeric"
                className={`input ${showErr("cpf") ? "error" : ""}`}
                placeholder="000.000.000-00"
                value={data.cpf}
                onChange={(e) =>
                  setData((p) => ({ ...p, cpf: maskCPF(e.target.value) }))
                }
                onBlur={() => markTouched("cpf")}
              />
              {showErr("cpf") && <p className="helpError">{errors.cpf}</p>}
            </div>

            <div>
              <label className="label">E-mail</label>
              <input
                data-field="email"
                type="email"
                className={`input ${showErr("email") ? "error" : ""}`}
                placeholder="email@exemplo.com"
                value={data.email}
                onChange={(e) =>
                  setData((p) => ({ ...p, email: e.target.value }))
                }
                onBlur={() => markTouched("email")}
              />
              {showErr("email") && <p className="helpError">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Telefone (WhatsApp)</label>
              <input
                data-field="phone"
                inputMode="numeric"
                className={`input ${showErr("phone") ? "error" : ""}`}
                placeholder="(92) 9XXXX-XXXX"
                value={data.phone}
                onChange={(e) =>
                  setData((p) => ({ ...p, phone: maskPhoneBR(e.target.value) }))
                }
                onBlur={() => markTouched("phone")}
              />
              {showErr("phone") && <p className="helpError">{errors.phone}</p>}
            </div>
          </div>

          {/* Associação */}
          <div className="card">
            <h2 className="h2">Associar à unidade</h2>

            <div className="grid grid3">
              <div>
                <label className="label">Obra</label>
                <select
                  data-field="developmentId"
                  className={`select ${
                    showErr("developmentId") ? "error" : ""
                  }`}
                  value={data.developmentId}
                  onChange={(e) => handleDevelopmentChange(e.target.value)}
                  onBlur={() => markTouched("developmentId")}
                  disabled={loadingDevelopments}
                >
                  <option value="">
                    {loadingDevelopments ? "Carregando obras..." : "Selecione"}
                  </option>
                  {developments.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nome}
                    </option>
                  ))}
                </select>
                {fetchError && <p className="helpError">{fetchError}</p>}
                {showErr("developmentId") && (
                  <p className="helpError">{errors.developmentId}</p>
                )}
              </div>

              <div>
                <label className="label">Torre</label>
                <select
                  data-field="buildingId"
                  className={`select ${showErr("buildingId") ? "error" : ""}`}
                  value={data.buildingId}
                  onChange={(e) => handleBuildingChange(e.target.value)}
                  onBlur={() => markTouched("buildingId")}
                  disabled={!data.developmentId || loadingBuildings}
                >
                  <option value="">
                    {loadingBuildings ? "Carregando torres..." : "Selecione"}
                  </option>
                  {buildings.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
                {showErr("buildingId") && (
                  <p className="helpError">{errors.buildingId}</p>
                )}
              </div>

              <div>
                <label className="label">Unidade</label>
                <select
                  data-field="unitId"
                  className={`select ${showErr("unitId") ? "error" : ""}`}
                  value={data.unitId}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  onBlur={() => markTouched("unitId")}
                  disabled={!data.buildingId || loadingUnits}
                >
                  <option value="">
                    {loadingUnits ? "Carregando unidades..." : "Selecione"}
                  </option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                      {u.numero ? ` • #${u.numero}` : ""}
                    </option>
                  ))}
                </select>
                {showErr("unitId") && (
                  <p className="helpError">{errors.unitId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="actions">
            <button
              type="submit"
              disabled={!formIsValid || submitLoading}
              className={`btnPrimary ${
                !formIsValid || submitLoading ? "btnPrimaryDisabled" : ""
              }`}
            >
              {submitLoading ? "Salvando..." : "Salvar cadastro"}
            </button>
            <button
              type="button"
              className="btnGhost"
              onClick={() =>
                setData({
                  name: "",
                  cpf: "",
                  email: "",
                  phone: "",
                  developmentId: "",
                  buildingId: "",
                  unitId: "",
                })
              }
            >
              Limpar
            </button>
          </div>

          {/* Mensagens */}
          {apiError && <div className="alertError">{apiError}</div>}
          {successMsg && <div className="alertSuccess">{successMsg}</div>}
        </form>
      </div>
    </div>
  );
}
