import type { Reclamacao } from "../utils/types";
import { formatDate, getStatusLabel, statusToClassName } from "../utils/formatters";

interface ReclamacoesTableProps {
  reclamacoes: Reclamacao[];
  loading: boolean;
  onRowClick: (reclamacao: Reclamacao) => void;
}

export function ReclamacoesTable({
  reclamacoes,
  loading,
  onRowClick,
}: ReclamacoesTableProps) {
  return (
    <div className="table-wrap">
      <table className="table table--compact table--hover table--zebra">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Status</th>
            <th>Usuário</th>
            <th>Item</th>
            <th>Data de Criação</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="empty">
                Carregando reclamações…
              </td>
            </tr>
          ) : reclamacoes.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty">
                Nenhuma reclamação encontrada.
              </td>
            </tr>
          ) : (
            reclamacoes.map((reclamacao) => {
              const description =
                reclamacao.description.length > 80
                  ? `${reclamacao.description.slice(0, 80)}...`
                  : reclamacao.description;

              return (
                <tr
                  key={reclamacao.id}
                  className="clickable-row"
                  onClick={() => onRowClick(reclamacao)}
                >
                  <td className="cell-desc" title={reclamacao.description}>
                    {description}
                  </td>
                  <td>
                    <span
                      className={`status ${statusToClassName(
                        reclamacao.status
                      )}`}
                    >
                      {getStatusLabel(reclamacao.status)}
                    </span>
                  </td>
                  <td>{reclamacao.user.name}</td>
                  <td>{reclamacao.item.name}</td>
                  <td className="cell-date">
                    {formatDate(reclamacao.created_at)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

