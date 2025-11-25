import { useState, useMemo, useCallback } from "react";
import { createEmptyFilters, type Filters } from "../utils/constants";

export const useFilters = () => {
  const [filters, setFilters] = useState<Filters>(createEmptyFilters());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<Filters>(createEmptyFilters());
  const [filterError, setFilterError] = useState<string | null>(null);

  const hasActiveFilters = useMemo(() => {
    const f = filters;
    return Boolean(
      f.startDate ||
        f.endDate ||
        f.itemId ||
        f.supplierId ||
        f.installerId ||
        f.statuses.length
    );
  }, [filters]);

  const openFilters = useCallback(() => {
    setDraftFilters({ ...filters, statuses: [...filters.statuses] });
    setFilterError(null);
    setFiltersOpen(true);
  }, [filters]);

  const closeFilters = useCallback(() => {
    setFiltersOpen(false);
    setFilterError(null);
  }, []);

  const applyFilters = useCallback(() => {
    setFilters({ ...draftFilters, statuses: [...draftFilters.statuses] });
    setFiltersOpen(false);
  }, [draftFilters]);

  const resetDraftFilters = useCallback(() => {
    setDraftFilters(createEmptyFilters());
  }, []);

  const clearAllFilters = useCallback(() => {
    const empty = createEmptyFilters();
    setFilters(empty);
    setDraftFilters(empty);
  }, []);

  const updateDraftFilter = useCallback(<K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleStatus = useCallback((status: string) => {
    setDraftFilters((prev) => {
      const isSelected = prev.statuses.includes(status);
      return {
        ...prev,
        statuses: isSelected
          ? prev.statuses.filter((s) => s !== status)
          : [...prev.statuses, status],
      };
    });
  }, []);

  return {
    filters,
    draftFilters,
    filtersOpen,
    filterError,
    hasActiveFilters,
    setFilterError,
    openFilters,
    closeFilters,
    applyFilters,
    resetDraftFilters,
    clearAllFilters,
    updateDraftFilter,
    toggleStatus,
  };
};

