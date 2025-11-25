import { Installer } from "../utils/types";

interface SelectedInstallersListProps {
  installers: Installer[];
  onRemove: (installerId: string) => void;
}

export default function SelectedInstallersList({
  installers,
  onRemove,
}: SelectedInstallersListProps) {
  if (installers.length === 0) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Nenhum instalador selecionado
      </div>
    );
  }

  return (
    <div className="mt-2 max-h-[4.5rem] overflow-y-auto overflow-x-hidden rounded-md">
      <div className="flex flex-wrap gap-2 pr-1">
        {installers.map((installer) => (
          <span
            key={installer.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
          >
            {installer.name}
            <button
              type="button"
              onClick={() => onRemove(installer.id)}
              className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-800 dark:hover:text-indigo-100"
              aria-label={`Remover ${installer.name}`}
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
