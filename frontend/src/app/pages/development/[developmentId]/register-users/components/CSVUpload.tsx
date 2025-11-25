import { formatFileSize } from "../utils/formatters";

interface CSVUploadProps {
  file: File | null;
  isDragging: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemove: () => void;
}

export function CSVUpload({
  file,
  isDragging,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
}: CSVUploadProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong className="font-semibold text-slate-700 dark:text-slate-300">
            Campos obrigatórios do arquivo CSV:
          </strong>
          <br />
          name, cpf, email, phone, unit_number, floor, building_name
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Arquivo CSV
        </label>
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative rounded-lg border-2 border-dashed transition-colors ${
            isDragging
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
              : "border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900"
          }`}
        >
          <input
            type="file"
            id="csv-file-upload"
            accept=".csv,text/csv,application/csv"
            onChange={onFileSelect}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <label
            htmlFor="csv-file-upload"
            className="flex cursor-pointer flex-col items-center justify-center p-8 text-center"
          >
            <div className="mb-2 text-4xl">📄</div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Clique para adicionar arquivo
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ou arraste e solte aqui
              </p>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                Apenas arquivos .csv
              </p>
            </div>
          </label>
        </div>

        {file && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                  <span className="text-xl">📄</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemove}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                aria-label="Remover arquivo"
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
          </div>
        )}
      </div>
    </div>
  );
}

