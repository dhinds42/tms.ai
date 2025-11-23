import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Truck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function StatusIndicatorBar({ loads }) {
  const statusGroups = {
    active: {
      count: loads.filter(l => ['dispatched', 'picked_up', 'in_transit', 'assigned'].includes(l.status)).length,
      label: 'Active',
      color: 'bg-blue-600',
      icon: Truck
    },
    pending: {
      count: loads.filter(l => ['available', 'tendered', 'booked'].includes(l.status)).length,
      label: 'Pending',
      color: 'bg-amber-600',
      icon: Clock
    },
    completed: {
      count: loads.filter(l => l.status === 'delivered').length,
      label: 'Completed',
      color: 'bg-emerald-600',
      icon: CheckCircle2
    },
    delayed: {
      count: loads.filter(l => l.status === 'in_transit' && l.eta && new Date(l.eta) < new Date()).length,
      label: 'Delayed',
      color: 'bg-red-600',
      icon: AlertTriangle
    },
    cancelled: {
      count: loads.filter(l => l.status === 'cancelled').length,
      label: 'Cancelled',
      color: 'bg-slate-600',
      icon: XCircle
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {Object.entries(statusGroups).map(([key, group]) => {
          const Icon = group.icon;
          return (
            <div 
              key={key}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${group.color} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${group.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">{group.label}</p>
                <p className="text-2xl font-bold text-slate-900">{group.count}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}