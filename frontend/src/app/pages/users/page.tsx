"use client";

import { useState, useEffect } from "react";
import { UserTypes } from "@/lib/userTypes";

type User = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  userType?: string;
  userTypeId?: string; // Backend pode estar usando este campo
  status: string;
};

const USER_TYPE_LABELS = {
  [UserTypes.admin]: "Administrador",
  [UserTypes.buildingManager]: "Coordenador de Obras",
  [UserTypes.client]: "Cliente/Morador",
};

// Helper para pegar o userType correto (backend pode usar userType ou userTypeId)
const getUserType = (user: User): string => {
  return user.userType || user.userTypeId || '';
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    cpf: string;
    phone: string;
    userType: UserTypes;
    unitId?: string;
  }>({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    userType: UserTypes.client,
    unitId: undefined,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkCurrentUser();
    loadUsers();
  }, []);

  const checkCurrentUser = async () => {
    try {

      
      const response = await fetch("/api/users/me", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = data.data || data;
        setCurrentUser(userData);
      } else {
        await response.json(); // Consume response
        setError("Você não está autenticado. Faça login primeiro.");
      }
    } catch {
      setError("Erro ao verificar autenticação. Faça login primeiro.");
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(""); // Limpa erro anterior
      
      const response = await fetch("/api/users", {
        credentials: "include",
      });
      
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro da API:", errorData);
        
        if (response.status === 403) {
          throw new Error("Acesso negado. Você precisa estar logado como administrador para acessar esta página.");
        }
        throw new Error(errorData.message || `Erro ao carregar usuários: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Usuários carregados:", data);
      setUsers(data.data || []);
      setError(""); // Limpa erro se sucesso
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      // Remove pontos e traços do CPF e telefone
      const onlyDigits = (s: string) => s.replace(/\D+/g, "");
      
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        cpf: onlyDigits(formData.cpf),
        phone: onlyDigits(formData.phone),
        userType: formData.userType,
        unitId: formData.unitId || undefined,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar usuário");
      }

      // Sucesso
      setFormData({
        name: "",
        email: "",
        cpf: "",
        phone: "",
        userType: UserTypes.client,
        unitId: undefined,
      });
      setShowModal(false);
      loadUsers();
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "Erro ao criar usuário");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleCloseModal = () => {
    if (!creating) {
      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        cpf: "",
        phone: "",
        userType: UserTypes.client,
        unitId: undefined,
      });
      setError("");
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
    setError("");
  };

  const handleCloseEditModal = () => {
    if (!creating) {
      setShowEditModal(false);
      setSelectedUser(null);
      setError("");
    }
  };

  const handleUpdateUserType = async (newUserType: UserTypes) => {
    if (!selectedUser) return;

    setCreating(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userTypeId: newUserType }), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar tipo de usuário");
      }

      // Sucesso
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "Erro ao atualizar tipo de usuário");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3739a2] to-[#1a1b4b]">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">
            Usuários
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 5v14M5 12h14"
              />
            </svg>
            Novo Usuário
          </button>
        </header>

        {/* Mensagem de Erro Global */}
        {error && !showModal && !showEditModal && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            
            {/* Mostrar informações de login */}
            {(error.includes("administrador") || error.includes("autenticado") || error.includes("login")) && (
              <div className="mt-3 space-y-2 text-xs">
                {currentUser && (
                  <div className="rounded border border-red-300 bg-red-100 p-2 dark:border-red-700 dark:bg-red-900">
                    <p className="font-medium">✅ Você está logado como:</p>
                    <p className="mt-1">Nome: <span className="font-semibold">{currentUser.name}</span></p>
                    <p>Email: <span className="font-semibold">{currentUser.email}</span></p>
                    <p>Tipo: <span className="font-semibold">{USER_TYPE_LABELS[getUserType(currentUser) as keyof typeof USER_TYPE_LABELS] || '(não reconhecido)'}</span></p>
                    <p className="text-xs mt-1 font-mono bg-red-200 dark:bg-red-800 p-1 rounded">
                      UserType UUID: {getUserType(currentUser) || '(vazio!)'}
                    </p>
                    <p className="text-xs mt-1 font-mono bg-red-200 dark:bg-red-800 p-1 rounded">
                      Admin UUID: {UserTypes.admin}
                    </p>
                    <p className="text-xs mt-1 font-mono bg-red-200 dark:bg-red-800 p-1 rounded">
                      🔍 Debug: userType={currentUser.userType || 'undefined'}, userTypeId={currentUser.userTypeId || 'undefined'}
                    </p>
                    <p className={`text-xs mt-1 font-semibold ${getUserType(currentUser) === UserTypes.admin ? 'text-green-700' : 'text-red-700'}`}>
                      {getUserType(currentUser) === UserTypes.admin ? '✅ UUIDs BATEM' : '❌ UUIDs NÃO BATEM'}
                    </p>
                  </div>
                )}
                {!currentUser && (
                  <div className="rounded border border-yellow-300 bg-yellow-100 p-2 dark:border-yellow-700 dark:bg-yellow-900">
                    <p className="font-medium">⚠️ Você NÃO está logado!</p>
                    <p className="mt-1">Por favor, faça login primeiro na página de autenticação.</p>
                    <a href="/pages/auth" className="mt-2 inline-block rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
                      Ir para Login
                    </a>
                  </div>
                )}
                <div>
                  <p className="font-medium">Para acessar esta página, use:</p>
                  <p className="mt-1">Email: <code className="rounded bg-red-100 px-1 dark:bg-red-900">admin@example.com</code></p>
                  <p>Senha: <code className="rounded bg-red-100 px-1 dark:bg-red-900">123456</code></p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabela de Usuários */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">
                    CPF
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">
                    Telefone
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      Carregando...
                    </td>
                  </tr>
                )}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      Nenhum usuário cadastrado
                    </td>
                  </tr>
                )}
                {!loading &&
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {user.cpf}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {user.phone}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {USER_TYPE_LABELS[user.userType as keyof typeof USER_TYPE_LABELS] || user.userType}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            user.status === "ATIVO"
                              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                          title="Alterar tipo de usuário"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal de Criação */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleCloseModal}
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Novo Usuário
                </h2>
                <button
                  onClick={handleCloseModal}
                  disabled={creating}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Tipo de Usuário */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Tipo de Usuário <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.userType}
                      onChange={(e) =>
                        setFormData({ ...formData, userType: e.target.value as UserTypes })
                      }
                      disabled={creating}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value={UserTypes.client}>Cliente/Morador</option>
                      <option value={UserTypes.buildingManager}>
                        Coordenador de Obras
                      </option>
                      <option value={UserTypes.admin}>Administrador</option>
                    </select>
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      disabled={creating}
                      placeholder="Ex: João Silva"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={creating}
                      placeholder="Ex: joao@example.com"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* CPF */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        CPF <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cpf}
                        onChange={(e) =>
                          setFormData({ ...formData, cpf: e.target.value })
                        }
                        disabled={creating}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Telefone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={creating}
                        placeholder="(00) 00000-0000"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Aviso sobre senha */}
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950">
                    <div className="flex gap-3">
                      <svg className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium">Senha gerada automaticamente</p>
                        <p className="mt-1 text-xs">
                          Uma senha temporária será gerada e enviada para o email do usuário. 
                          O usuário deverá alterá-la no primeiro acesso.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={creating}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    {creating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Criando...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Criar Usuário
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Edição de Tipo de Usuário */}
        {showEditModal && selectedUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleCloseEditModal}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Alterar Tipo de Usuário
                </h2>
                <button
                  onClick={handleCloseEditModal}
                  disabled={creating}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                    {error}
                  </div>
                )}

                {/* Info do Usuário */}
                <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {selectedUser.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedUser.email}
                  </p>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    Tipo atual: <span className="font-medium">{USER_TYPE_LABELS[selectedUser.userType as keyof typeof USER_TYPE_LABELS]}</span>
                  </p>
                </div>

                {/* Seleção de Novo Tipo */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Selecione o novo tipo:
                  </p>

                  <button
                    onClick={() => handleUpdateUserType(UserTypes.client)}
                    disabled={creating || selectedUser.userType === UserTypes.client}
                    className="w-full rounded-lg border-2 border-slate-200 p-4 text-left transition-all hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-950"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          Cliente/Morador
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Acesso às próprias unidades e reclamações
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleUpdateUserType(UserTypes.buildingManager)}
                    disabled={creating || selectedUser.userType === UserTypes.buildingManager}
                    className="w-full rounded-lg border-2 border-slate-200 p-4 text-left transition-all hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-950"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                        <svg className="h-5 w-5 text-orange-600 dark:text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          Coordenador de Obras
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Gerencia empreendimentos e unidades
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleUpdateUserType(UserTypes.admin)}
                    disabled={creating || selectedUser.userType === UserTypes.admin}
                    className="w-full rounded-lg border-2 border-slate-200 p-4 text-left transition-all hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-950"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                        <svg className="h-5 w-5 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          Administrador
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Acesso total ao sistema
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {creating && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                    Atualizando...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}