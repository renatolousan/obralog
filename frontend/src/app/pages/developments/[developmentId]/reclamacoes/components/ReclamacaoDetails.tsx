import Image from "next/image";
import { buildBackendUrl } from "@/app/api/_lib/backend";
import { formatDate, getStatusLabel, statusToClassName } from "../utils/formatters";
import { RepairInfo } from "./RepairInfo";
import type { Reclamacao } from "../utils/types";

interface ReclamacaoDetailsProps {
  reclamacao: Reclamacao;
  onImageClick: (imagePath: string) => void;
}

export function ReclamacaoDetails({
  reclamacao,
  onImageClick,
}: ReclamacaoDetailsProps) {
  return (
    <div className="modal-body">
      <div className="detail-group">
        <label>Data/Hora:</label>
        <span>{formatDate(reclamacao.created_at)}</span>
      </div>

      <div className="detail-group">
        <label>Issue:</label>
        <span className="issue-chip">{reclamacao.issue}</span>
      </div>

      <div className="detail-group">
        <label>Usuário:</label>
        <span>
          {reclamacao.user.name} ({reclamacao.user.email})
        </span>
      </div>

      <div className="detail-group">
        <label>Item:</label>
        <span>{reclamacao.item.name}</span>
      </div>

      {reclamacao.item.unit && (
        <div className="detail-group">
          <label>Unidade:</label>
          <span>
            {reclamacao.item.unit.name} • #{reclamacao.item.unit.number} • Andar{" "}
            {reclamacao.item.unit.floor}
            {reclamacao.item.unit.torre && (
              <> • Torre {reclamacao.item.unit.torre.name}</>
            )}
          </span>
        </div>
      )}

      <div className="detail-group">
        <label>Status:</label>
        <span className={`status ${statusToClassName(reclamacao.status)}`}>
          {getStatusLabel(reclamacao.status)}
        </span>
      </div>

      <div className="detail-group full-width">
        <label>Descrição:</label>
        <div className="description-content">{reclamacao.description}</div>
      </div>

      <RepairInfo reclamacao={reclamacao} />

      {reclamacao.attachments && reclamacao.attachments.length > 0 && (
        <div className="detail-group full-width">
          <label>Anexos ({reclamacao.attachments.length}):</label>
          <div className="attachments-grid-horizontal">
            {reclamacao.attachments
              .filter((anexo) => anexo.mime_type.startsWith("image/"))
              .map((anexo) => (
                <div
                  key={anexo.id}
                  className="attachment-thumbnail"
                  onClick={() => onImageClick(anexo.path)}
                >
                  <Image
                    src={buildBackendUrl(anexo.path).toString()}
                    alt={anexo.original_name}
                    className="thumbnail-image"
                    width={120}
                    height={120}
                    style={{ objectFit: "cover", cursor: "pointer" }}
                    unoptimized
                  />
                  <div className="thumbnail-overlay" />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

