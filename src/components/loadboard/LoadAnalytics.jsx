import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, Percent, Truck, Clock } from "lucide-react";

export default function LoadAnalytics({ loads, operatingMode }) {
  const totalRevenue = loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalMargin = loads.reduce((sum, l) => sum + ((l.customer_rate || 0) - (l.carrier_pay || 0)), 0);
  const avgMargin = loads.length > 0 && totalRevenue > 0 
    ? ((totalMargin / totalRevenue) * 100).toFixed(1) 
    : 0;
  
  const activeLoads = loads.filter(l => 
    ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(l.status)
  ).length;

  const pendingLoads = loads.filter(l => ['available', 'tendered'].includes(l.status)).length;

  const stats = [
    { 
      label: 'Total', 
      value: loads.length, 
      icon: Package, 
      color: 'text-slate-700',
      bg: 'bg-slate-100'
    },
    { 
      label: 'Active', 
      value: activeLoads, 
      icon: Truck, 
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      label: 'Pending', 
      value: pendingLoads, 
      icon: Clock, 
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    { 
      label: operatingMode === 'broker' ? 'Revenue' : 'Value', 
      value: `$${(totalRevenue / 1000).toFixed(0)}K`, 
      icon: DollarSign, 
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
  ];

  if (operatingMode === 'broker') {
    stats.push({ 
      label: 'Margin', 
      value: `${avgMargin}%`, 
      icon: Percent, 
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    });
  }

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-3">
        <div className={`grid gap-2 ${operatingMode === 'broker' ? 'grid-cols-5' : 'grid-cols-4'}`}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className={`${stat.bg} rounded-lg p-2.5 text-center`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                </div>
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}