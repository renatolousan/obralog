import type { UserFormData } from "../utils/types";
import type { Building, Unit } from "../utils/types";

interface UserIndividualFormProps {
  formData: UserFormData;
  buildings: Building[];
  units: Unit[];
  selectedBuilding: string;
  onFieldChange: <K extends keyof UserFormData>(
    key: K,
    value: UserFormData[K]
  ) => void;
  onBuildingChange: (buildingId: string) => void;
}

export function UserIndividualForm({
  formData,
  buildings,
  units,
  selectedBuilding,
  onFieldChange,
  onBuildingChange,
}: UserIndividualFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Nome *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
        />
      </div>

      <div>
        <label
          htmlFor="cpf"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          CPF *
        </label>
        <input
          type="text"
          id="cpf"
          name="cpf"
          value={formData.cpf}
          onChange={(e) => onFieldChange("cpf", e.target.value)}
          required
          placeholder="000.000.000-00"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={(e) => onFieldChange("email", e.target.value)}
          required
          placeholder="usuario@exemplo.com"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Número de Telefone *
        </label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={(e) => onFieldChange("phone", e.target.value)}
          required
          placeholder="(00) 00000-0000"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
        />
      </div>

      <div>
        <label
          htmlFor="building"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Torre *
        </label>
        <select
          id="building"
          value={selectedBuilding}
          onChange={(e) => onBuildingChange(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
        >
          <option value="">Selecione uma torre</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="unitId"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Unidade *
        </label>
        <select
          id="unitId"
          name="unitId"
          value={formData.unitId}
          onChange={(e) => onFieldChange("unitId", e.target.value)}
          required
          disabled={!selectedBuilding}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 dark:focus:border-indigo-400"
        >
          <option value="">
            {selectedBuilding
              ? "Selecione uma unidade"
              : "Selecione uma torre primeiro"}
          </option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.nome} - Nº {unit.numero}
              {unit.andar !== null ? ` (Andar ${unit.andar})` : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

