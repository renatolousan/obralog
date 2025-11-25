import type { InstallerOption } from "../utils/types";
import type { VisitFormData } from "../hooks/useVisitForm";

interface VisitFormProps {
  formData: VisitFormData;
  installers: InstallerOption[];
  loadingInstallers: boolean;
  error: string | null;
  updatingStatus: boolean;
  onFieldChange: <K extends keyof VisitFormData>(
    field: K,
    value: VisitFormData[K]
  ) => void;
  onToggleForeman: (foremanId: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function VisitForm({
  formData,
  installers,
  loadingInstallers,
  error,
  updatingStatus,
  onFieldChange,
  onToggleForeman,
  onSubmit,
  onCancel,
}: VisitFormProps) {
  return (
    <div className="visit-form-container">
      <h4>Agendar Visita</h4>
      <div className="form-group">
        <label htmlFor="visit-date">Data:</label>
        <input
          id="visit-date"
          type="date"
          className="input"
          value={formData.date}
          onChange={(e) => onFieldChange("date", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="visit-time">Hora:</label>
        <input
          id="visit-time"
          type="time"
          className="input"
          value={formData.time}
          onChange={(e) => onFieldChange("time", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="visit-duration">Duração (minutos):</label>
        <input
          id="visit-duration"
          type="number"
          className="input"
          min="15"
          step="15"
          value={formData.duration}
          onChange={(e) => onFieldChange("duration", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Encarregados:</label>
        {loadingInstallers ? (
          <div>Carregando encarregados...</div>
        ) : installers.length === 0 ? (
          <div className="hint">Nenhum encarregado encontrado</div>
        ) : (
          <div className="foremen-list">
            {installers.map((installer) => (
              <label key={installer.id} className="foreman-checkbox">
                <input
                  type="checkbox"
                  checked={formData.foremen_id.includes(installer.id)}
                  onChange={() => onToggleForeman(installer.id)}
                />
                <span>
                  {installer.name} - {installer.phone}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="repair-cost">Custo do Reparo (R$):</label>
        <input
          id="repair-cost"
          type="text"
          inputMode="decimal"
          className="input"
          placeholder="Ex: 1250.00 ou 150.50"
          value={formData.repairCost}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d.]/g, "");
            onFieldChange("repairCost", value);
          }}
        />
        <small
          style={{
            color: "var(--muted)",
            fontSize: "12px",
            marginTop: "4px",
            display: "block",
          }}
        >
          Digite o valor em reais (use ponto para centavos)
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="installer-select">
          Prestador de Serviço Executante:
        </label>
        <select
          id="installer-select"
          className="input"
          value={formData.id_installer}
          onChange={(e) => onFieldChange("id_installer", e.target.value)}
        >
          <option value="">Selecione um prestador</option>
          {installers.map((installer) => (
            <option key={installer.id} value={installer.id}>
              {installer.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="form-message error">{error}</div>}
      <div className="form-actions">
        <button className="btn secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className="btn primary"
          onClick={onSubmit}
          disabled={updatingStatus}
        >
          {updatingStatus ? "Agendando..." : "Agendar"}
        </button>
      </div>
    </div>
  );
}
