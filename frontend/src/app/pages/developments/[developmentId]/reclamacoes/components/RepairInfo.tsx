import { formatDate, formatCurrency } from "../utils/formatters";
import type { Reclamacao } from "../utils/types";

interface RepairInfoProps {
  reclamacao: Reclamacao;
}

export function RepairInfo({ reclamacao }: RepairInfoProps) {
  if (!reclamacao.repairCost) return null;

  return (
    <div
      className="detail-group full-width"
      style={{
        backgroundColor: "var(--panel)",
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid var(--accent)",
        marginTop: "16px",
      }}
    >
      <h4
        style={{
          color: "var(--accent)",
          marginBottom: "12px",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        Informações de Reparo
      </h4>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              color: "var(--muted)",
              marginBottom: "4px",
              fontWeight: "500",
            }}
          >
            Custo do Reparo:
          </label>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "var(--accent)",
            }}
          >
            R$ {formatCurrency(Number(reclamacao.repairCost))}
          </span>
        </div>

        {reclamacao.installer && (
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "var(--muted)",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Prestador de Serviço:
            </label>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text)",
              }}
            >
              {reclamacao.installer.name}
            </span>
            {reclamacao.installer.phone && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  marginTop: "2px",
                }}
              >
                {reclamacao.installer.phone}
              </div>
            )}
          </div>
        )}
      </div>

      {reclamacao.completedAt && (
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <label
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              marginRight: "8px",
            }}
          >
            Concluído em:
          </label>
          <span
            style={{
              fontSize: "13px",
              color: "var(--text)",
              fontWeight: "500",
            }}
          >
            {formatDate(reclamacao.completedAt)}
          </span>
        </div>
      )}
    </div>
  );
}

