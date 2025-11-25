import Image from "next/image";
import { buildBackendUrl } from "@/lib/api";
import { getStatusLabel, getStatusVariant, getStatusColors } from "../utils/formatters";
import { VisitInfo } from "./VisitInfo";
import type { Atividade } from "../utils/types";

interface ActivityDetailsProps {
  activity: Atividade;
  onImageClick: (imagePath: string) => void;
}

export function ActivityDetails({ activity, onImageClick }: ActivityDetailsProps) {
  const statusCode = activity.status_codigo || activity.status;
  const statusLabel = getStatusLabel(statusCode);
  const statusVariant = getStatusVariant(statusCode);
  const statusColorClass = getStatusColors(statusVariant);

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      <div className="grid grid-cols-[120px_1fr] gap-3 mb-4 items-start sm:grid-cols-[120px_1fr] sm:gap-3 sm:mb-4">
        <label className="text-slate-500 text-sm font-medium m-0">
          Data/Hora:
        </label>
        <span className="text-slate-100 text-sm">{activity.data_hora}</span>
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-3 mb-4 items-start sm:grid-cols-[120px_1fr] sm:gap-3 sm:mb-4">
        <label className="text-slate-500 text-sm font-medium m-0">Issue:</label>
        <span className="inline-block mx-auto px-2 py-1 rounded-full border border-slate-700 bg-slate-900 text-indigo-200 font-semibold text-xs tracking-wide">
          {activity.issue}
        </span>
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-3 mb-4 items-start sm:grid-cols-[120px_1fr] sm:gap-3 sm:mb-4">
        <label className="text-slate-500 text-sm font-medium m-0">
          ID do Item:
        </label>
        <span className="text-slate-100 text-sm">{activity.id_item}</span>
      </div>

      {activity.item && (
        <div className="grid grid-cols-[120px_1fr] gap-3 mb-4 items-start sm:grid-cols-[120px_1fr] sm:gap-3 sm:mb-4">
          <label className="text-slate-500 text-sm font-medium m-0">
            Item instalado:
          </label>
          <span className="text-slate-100 text-sm">{activity.item.nome}</span>
        </div>
      )}

      {activity.unidade && (
        <div className="grid grid-cols-[120px_1fr] gap-3 mb-4 items-start sm:grid-cols-[120px_1fr] sm:gap-3 sm:mb-4">
          <label className="text-slate-500 text-sm font-medium m-0">
            Unidade:
          </label>
          <span className="text-slate-100 text-sm">
            {activity.unidade.nome} • #{activity.unidade.numero ?? ""}
          </span>
        </div>
      )}

      {activity.item?.fornecedor && (
        <div className="grid grid-cols-[120px_1fr] gap-3 mb-4 items-start sm:grid-cols-[120px_1fr] sm:gap-3 sm:mb-4">
          <label className="text-slate-500 text-sm font-medium m-0">
            Fornecedor:
          </label>
          <span className="text-slate-100 text-sm">
            {activity.item.fornecedor.nome}
          </span>
        </div>
      )}

      {activity.item?.instaladores && activity.item.instaladores.length > 0 && (
        <div className="grid grid-cols-[120px_1fr] gap-3 mb-4 items-start sm:grid-cols-[120px_1fr] sm:gap-3 sm:mb-4">
          <label className="text-slate-500 text-sm font-medium m-0">
            Instaladores:
          </label>
          <span className="text-slate-100 text-sm">
            {activity.item.instaladores.map((installer) => installer.nome).join(", ")}
          </span>
        </div>
      )}

      <div className="grid grid-cols-[120px_1fr] gap-3 mb-4 items-start sm:grid-cols-[120px_1fr] sm:gap-3 sm:mb-4">
        <label className="text-slate-500 text-sm font-medium m-0">Status:</label>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border capitalize font-medium text-xs ${statusColorClass}`}
          data-status-code={statusCode}
        >
          <span className="w-2 h-2 rounded-full bg-current opacity-85 shadow-[0_0_0_2px_rgba(0,0,0,0.25)]" />
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 mb-4">
        <label className="text-slate-500 text-sm font-medium m-0">
          Descrição:
        </label>
        <div className="bg-slate-900 p-4 rounded-lg text-slate-100 text-sm leading-relaxed border border-slate-700 whitespace-pre-wrap break-words">
          {activity.descricao}
        </div>
      </div>

      {activity.anexos && activity.anexos.length > 0 && (
        <div className="grid grid-cols-1 gap-2 mb-4">
          <label className="text-slate-500 text-sm font-medium m-0">
            Anexos ({activity.anexos.length}):
          </label>
          <div className="flex flex-wrap gap-3">
            {activity.anexos
              .filter((anexo) => anexo.tipo.startsWith("image/"))
              .map((anexo) => (
                <div
                  key={anexo.id}
                  className="relative w-[120px] h-[120px] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onImageClick(anexo.caminho)}
                >
                  <Image
                    src={buildBackendUrl(anexo.caminho)}
                    alt={anexo.nome_original}
                    className="object-cover"
                    width={120}
                    height={120}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

