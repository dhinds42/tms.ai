import { useState } from "react";

export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState("");

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setSearchTerm("");
  };

  const applyFilters = (items, filterFn) => {
    return items.filter(item => filterFn(item, filters, searchTerm));
  };

  return {
    filters,
    searchTerm,
    setSearchTerm,
    updateFilter,
    setFilters,
    clearFilters,
    applyFilters
  };
}