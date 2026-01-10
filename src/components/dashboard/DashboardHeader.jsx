import React from "react";
import { LayoutDashboard } from "lucide-react";
import PageHeader from "@/components/design-system/PageHeader";
import { Badge } from "@/components/ui/badge";

export default function DashboardHeader({ operatingMode }) {
  return (
    <PageHeader
      title="Dashboard"
      subtitle="Overview of your operations"
      icon={LayoutDashboard}
      modeBadge={
        <Badge className={operatingMode === 'carrier' ? 'bg-blue-600' : 'bg-indigo-600'}>
          {operatingMode}
        </Badge>
      }
    />
  );
}