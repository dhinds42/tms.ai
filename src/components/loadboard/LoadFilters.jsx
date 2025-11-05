import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LoadFilters({ equipmentFilter, setEquipmentFilter }) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-xs text-slate-600">Equipment Type</Label>
          <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Equipment</SelectItem>
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
      </div>
    </div>
  );
}