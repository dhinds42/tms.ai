import React from "react";
import { Plus, Truck } from "lucide-react";
import { EmptyState } from "@/components/design-system";
import LoadCard from "./LoadCard";
import LoadShortcutsMenu from "./LoadShortcutsMenu";

export default function LoadBoardGrid({
  loads,
  isLoading,
  searchTerm,
  equipmentFilter,
  selectedLoads,
  onSelectLoad,
  onSelectAll,
  onCreateLoad,
  operatingMode,
  shortcuts
}) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="mt-3 text-sm" style={{ color: 'var(--text-primary)' }}>Loading loads...</p>
      </div>
    );
  }

  if (loads.length === 0) {
    return (
      <EmptyState
        icon={Truck}
        title="No loads found"
        description={searchTerm || equipmentFilter !== 'all'
          ? 'Try adjusting your filters'
          : 'Create your first load to get started'}
        action={!searchTerm && {
          label: 'Create Load',
          icon: Plus,
          onClick: onCreateLoad
        }}
      />
    );
  }

  return (
    <>
      {/* Select All & Count */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedLoads.length === loads.length && loads.length > 0}
            onChange={onSelectAll}
            className="w-4 h-4 rounded border-slate-300"
          />
          <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
            {selectedLoads.length > 0 
              ? `${selectedLoads.length} selected`
              : `${loads.length} loads`}
          </span>
        </div>
      </div>

      {/* Load Cards Grid */}
      <div className="grid gap-3 grid-cols-1">
        {loads.map((load) => (
          <div key={load.id} className="relative group">
            <div className="absolute top-3 right-3 z-10">
              <LoadShortcutsMenu
                load={load}
                operatingMode={operatingMode}
                {...shortcuts}
              />
            </div>
            <LoadCard
              load={load}
              onSelect={() => onSelectLoad(load.id)}
              isSelected={selectedLoads.includes(load.id)}
              operatingMode={operatingMode}
            />
          </div>
        ))}
      </div>
    </>
  );
}