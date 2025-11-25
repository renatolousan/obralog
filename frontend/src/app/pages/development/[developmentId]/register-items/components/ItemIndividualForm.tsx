import type { ItemFormData } from "../utils/types";
import type { Building, Unit, Supplier, Installer } from "../utils/types";
import SelectedInstallersList from "./selectedInstallersList";

interface ItemIndividualFormProps {
  formData: ItemFormData;
  buildings: Building[];
  units: Unit[];
  suppliers: Supplier[];
  installers: Installer[];
  selectedBuilding: string;
  selectedInstallers: Installer[];
  onFieldChange: <K extends keyof ItemFormData>(
    key: K,
    value: ItemFormData[K]
  ) => void;
  onBuildingChange: (buildingId: string) => void;
  onSupplierChange: (supplier: Supplier) => void;
  onInstallerAdd: (installer: Installer) => void;
  onInstallerRemove: (installerId: string) => void;
}

export function ItemIndividualForm({
  formData,
  buildings,
  units,
  suppliers,
  installers,
  selectedBuilding,
  selectedInstallers,
  onFieldChange,
  onBuildingChange,
  onSupplierChange,
  onInstallerAdd,
  onInstallerRemove,
}: ItemIndividualFormProps) {
  // Filtrar instaladores que já foram selecionados
  const availableInstallers = installers.filter(
    (installer) => !selectedInstallers.some((si) => si.id === installer.id)
  );
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Nome do Item *
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
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="value"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Valor (R$)
          </label>
          <input
            type="number"
            id="value"
            name="value"
            value={formData.value}
            onChange={(e) => onFieldChange("value", e.target.value)}
            step="0.01"
            min="0"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
          />
        </div>

        <div>
          <label
            htmlFor="batch"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Lote
          </label>
          <input
            type="text"
            id="batch"
            name="batch"
            value={formData.batch}
            onChange={(e) => onFieldChange("batch", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
          />
        </div>

        <div>
          <label
            htmlFor="warranty"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Garantia (meses)
          </label>
          <input
            type="number"
            id="warranty"
            name="warranty"
            value={formData.warranty}
            onChange={(e) => onFieldChange("warranty", e.target.value)}
            min="0"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
          />
        </div>
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

      <div>
        <label
          htmlFor="supplier"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Fornecedor *
        </label>
        <select
          id="supplier"
          value={formData.supplierCnpj}
          onChange={(e) => {
            const supplier = suppliers.find((s) => s.cnpj === e.target.value);
            if (supplier) onSupplierChange(supplier);
          }}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
        >
          <option value="">Selecione um fornecedor</option>
          {suppliers.map((supplier) => (
            <option key={supplier.cnpj} value={supplier.cnpj}>
              {supplier.name} - {supplier.cnpj}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="installer"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
        </label>
        <div className="space-y-2">
          <div>
            <div className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Instaladores/prestadores encarregados:
            </div>
            <SelectedInstallersList
              installers={selectedInstallers}
              onRemove={onInstallerRemove}
            />
          </div>
          <select
            id="installer"
            value=""
            onChange={(e) => {
              const installer = installers.find((i) => i.id === e.target.value);
              if (installer) {
                onInstallerAdd(installer);
                e.target.value = "";
              }
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-indigo-400"
          >
            <option value="">
              {availableInstallers.length > 0
                ? "Selecione um instalador"
                : "Todos os instaladores foram selecionados"}
            </option>
            {availableInstallers.map((installer) => (
              <option key={installer.id} value={installer.id}>
                {installer.name} - {installer.phone}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
