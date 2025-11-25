"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateUnitModal } from "./CreateunitModal";

// Tipo para unidades
type Unit = {
  id: string;
  nome: string;
  numero: number;
  andar: number | null;
  torre: Building;
};

type Building = {
  id: string;
  nome: string;
};

type Development = {
  id: number | string;
  nome: string;
  descricao?: string | null;
  endereco?: string | null;
};

type Props = {
  development: Development;
  units: Unit[];
  buildings: Building[];
  loadingUnits: boolean;
  unitsError: string;
  onClose: () => void;
  onEdit?: (dev: Development) => void;
  onRefreshUnits: () => void;
};

export function DevelopmentDetailsModal({
  development,
  units,
  buildings,
  loadingUnits,
  unitsError,
  onClose,
  onEdit,
  onRefreshUnits,
}: Props) {
  const router = useRouter();
  // Estado para modal de criação de unidade
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Detalhes do Empreendimento
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            title="Fechar"
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

        {/* Conteúdo do Modal */}
        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-6">
          {/* Nome */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nome do Empreendimento
            </label>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {development.nome}
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Descrição
            </label>
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
              {development.descricao || (
                <span className="italic text-slate-400 dark:text-slate-500">
                  Sem descrição cadastrada
                </span>
              )}
            </p>
          </div>

          {/* Endereço */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Endereço
            </label>
            <p className="text-base text-slate-700 dark:text-slate-200">
              {development.endereco || (
                <span className="italic text-slate-400 dark:text-slate-500">
                  Sem endereço cadastrado
                </span>
              )}
            </p>
          </div>

          {/* Lista de Unidades */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Unidades Cadastradas
              </label>
              {buildings.length > 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
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
                  Nova Unidade
                </button>
              )}
            </div>

            {loadingUnits && (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                <span className="ml-3 text-sm text-slate-600 dark:text-slate-400">
                  Carregando unidades...
                </span>
              </div>
            )}

            {unitsError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300">
                {unitsError}
              </div>
            )}

            {!loadingUnits && !unitsError && units.length === 0 && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                Nenhuma unidade cadastrada neste empreendimento
              </div>
            )}

            {!loadingUnits && !unitsError && units.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300">
                        Torre
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300">
                        Nome
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300">
                        Número
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300">
                        Andar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {units.map((unit) => (
                      <tr
                        key={unit.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {unit.torre.nome}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {unit.nome}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {unit.numero}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {unit.andar ?? (
                            <span className="italic text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button
            onClick={() => {
              router.push(
                `/pages/development/${development.id}/register-users`
              );
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Cadastro de moradores
          </button>
          <button
            onClick={() => {
              router.push(
                `/pages/development/${development.id}/register-items`
              );
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Cadastrar itens
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit?.(development);
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Editar estrutura
          </button>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal de Criação de Unidade */}
      <CreateUnitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        buildings={buildings}
        onSuccess={onRefreshUnits}
      />
    </div>
  );
}
