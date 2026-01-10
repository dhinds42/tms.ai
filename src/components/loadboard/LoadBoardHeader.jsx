import React from "react";
import { Plus, Download, BarChart2 } from "lucide-react";
import { Truck } from "lucide-react";
import PageHeader from "@/components/design-system/PageHeader";

export default function LoadBoardHeader({ 
  totalLoads, 
  unassignedCount, 
  onCreateLoad,
  onExport,
  onSmartMatch 
}) {
  return (
    <PageHeader
      title="Loads"
      subtitle={`${totalLoads} total • ${unassignedCount} unassigned`}
      icon={Truck}
      primaryAction={{
        label: 'Create Load',
        icon: Plus,
        onClick: onCreateLoad
      }}
      secondaryActions={[
        { label: 'Export Loads', icon: Download, onClick: onExport },
        { label: 'Smart Match', icon: BarChart2, onClick: onSmartMatch }
      ]}
    />
  );
}