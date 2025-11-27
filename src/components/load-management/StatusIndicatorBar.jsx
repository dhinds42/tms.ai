import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Truck, CheckCircle2, AlertTriangle, XCircle, Package, DollarSign } from "lucide-react";

export default function StatusIndicatorBar({ loads, onFilterByStatus }) {
  const statusGroups = [
    {
      key: 'active',
      count: loads.filter(l => ['dispatched', 'picked_up', 'in_transit', 'assigned'].includes(l.status)).length,
      label: 'Active',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Truck
    },
    {
      key: 'pending',
      count: loads.filter(l => ['available', 'tendered', 'booked'].includes(l.status)).length,
      label: 'Pending',
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: Clock
    },
    {
      key: 'completed',
      count: loads.filter(l => l.status === 'delivered').length,
      label: 'Delivered',
      gradient: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: CheckCircle2
    },
    {
      key: 'invoiced',
      count: loads.filter(l => l.status === 'invoiced' || l.invoice_status === 'sent').length,
      label: 'Invoiced',
      gradient: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: DollarSign
    },
    {
      key: 'delayed',
      count: loads.filter(l => l.status === 'in_transit' && l.eta && new Date(l.eta) < new Date()).length,
      label: 'Delayed',
      gradient: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle
    },
    {
      key: 'cancelled',
      count: loads.filter(l => l.status === 'cancelled').length,
      label: 'Cancelled',
      gradient: 'from-slate-500 to-gray-500',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      icon: XCircle
    }
  ];

  const totalLoads = loads.length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {statusGroups.map((group) => {
        const Icon = group.icon;
        const percentage = totalLoads > 0 ? ((group.count / totalLoads) * 100).toFixed(0) : 0;
        
        return (
          <div 
            key={group.key}
            onClick={() => onFilterByStatus?.(group.key)}
            className={`${group.bgColor} ${group.borderColor} border rounded-xl p-3 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${group.gradient}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              {group.count > 0 && (
                <span className="text-xs text-slate-500">{percentage}%</span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900">{group.count}</p>
            <p className="text-xs text-slate-600 font-medium">{group.label}</p>
          </div>
        );
      })}
    </div>
  );
}