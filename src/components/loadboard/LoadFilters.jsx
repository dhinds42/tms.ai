import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdvancedLoadFilters from "./AdvancedLoadFilters";

export default function LoadFilters({ equipmentFilter, setEquipmentFilter, onAdvancedFilter }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});

  const handleApplyAdvanced = () => {
    if (onAdvancedFilter) {
      onAdvancedFilter(advancedFilters);
    }
    setShowAdvanced(false);
  };

  const handleResetAdvanced = () => {
    setAdvancedFilters({});
    if (onAdvancedFilter) {
      onAdvancedFilter({});
    }
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-slate-700">Equipment:</label>
        <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="cargo_van">Cargo Van</SelectItem>
            <SelectItem value="sprinter">Sprinter</SelectItem>
            <SelectItem value="box_truck">Box Truck</SelectItem>
            <SelectItem value="dry_van">Dry Van</SelectItem>
            <SelectItem value="reefer">Reefer</SelectItem>
            <SelectItem value="flatbed">Flatbed</SelectItem>
            <SelectItem value="step_deck">Step Deck</SelectItem>
            <SelectItem value="lowboy">Lowboy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={() => setShowAdvanced(true)}
        variant="outline"
        className="border-indigo-300 text-indigo-700"
      >
        <SlidersHorizontal className="w-4 h-4 mr-2" />
        Advanced Filters
      </Button>

      {/* Advanced Filters Modal */}
      <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Advanced Load Filters
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <AdvancedLoadFilters
              filters={advancedFilters}
              setFilters={setAdvancedFilters}
              onApply={handleApplyAdvanced}
              onReset={handleResetAdvanced}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}