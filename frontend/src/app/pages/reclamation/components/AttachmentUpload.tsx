import Image from "next/image";
import { formatFileSize } from "../utils/formatters";
import type { AttachmentPreview } from "../utils/types";

interface AttachmentUploadProps {
  attachments: AttachmentPreview[];
  onFileSelect: (files: File[]) => void;
  onRemove: (id: string) => void;
}

export function AttachmentUpload({
  attachments,
  onFileSelect,
  onRemove,
}: AttachmentUploadProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length) {
      onFileSelect(files);
      event.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <label className="text-slate-500 text-xs">
        Anexos (imagens JPEG/PNG)
      </label>
      <div className="relative">
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/jpeg,image/png"
          onChange={handleFileUpload}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center py-10 px-5 border-2 border-dashed border-slate-700 rounded-lg bg-slate-950 cursor-pointer transition-all text-center hover:border-indigo-600 hover:bg-indigo-600/5"
        >
          <div className="text-3xl mb-3">📎</div>
          <div>
            <strong className="block mb-1 text-slate-100">
              Clique para adicionar arquivos
            </strong>
            <span className="text-slate-500 text-sm">
              ou arraste e solte aqui
            </span>
          </div>
        </label>
      </div>

      {attachments.length > 0 && (
        <div className="mt-4">
          <h4 className="text-slate-100 text-sm mb-3 font-semibold">
            Anexos selecionados ({attachments.length})
          </h4>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="relative bg-slate-950 border border-slate-700 rounded-lg overflow-hidden transition-transform hover:-translate-y-0.5"
              >
                <div className="w-full h-[120px] overflow-hidden flex items-center justify-center bg-slate-900">
                  <Image
                    src={attachment.previewUrl}
                    alt={attachment.file.name}
                    className="w-full h-full object-cover"
                    width={200}
                    height={120}
                    unoptimized
                  />
                </div>
                <div className="px-3 py-2 flex flex-col gap-0.5">
                  <span className="text-xs text-slate-100 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {attachment.file.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {formatFileSize(attachment.file.size)}
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute top-1 right-1 w-6 h-6 border-none rounded-full bg-black/70 text-white cursor-pointer flex items-center justify-center text-xs transition-colors hover:bg-red-600/80"
                  onClick={() => onRemove(attachment.id)}
                  aria-label="Remover anexo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

