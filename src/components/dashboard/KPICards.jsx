import React from "react";
import KPICard from "./KPICard";
import { Truck, DollarSign, CheckCircle2, TrendingUp } from "lucide-react";

export default function KPICards({ loads, operatingMode }) {
  const activeLoads = loads.filter(l => 
    ['dispatched', 'picked_up', 'in_transit'].includes(l.status)
  ).length;

  const completedLoads = loads.filter(l => 
    l.status === 'delivered'
  ).length;

  const totalRevenue = loads
    .filter(l => l.customer_rate)
    .reduce((sum, l) => sum + (l.customer_rate || 0), 0);

  const totalCost = loads
    .filter(l => l.carrier_pay)
    .reduce((sum, l) => sum + (l.carrier_pay || 0), 0);

  const margin = totalRevenue > 0 
    ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1)
    : 0;

  const avgRate = completedLoads > 0
    ? (totalRevenue / completedLoads).toFixed(0)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Active Loads"
        value={activeLoads}
        icon={Truck}
        iconColor="text-blue-600"
        iconBg="bg-blue-100"
      />
      
      {operatingMode === 'broker' ? (
        <>
          <KPICard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100"
          />
          <KPICard
            title="Completed Loads"
            value={completedLoads}
            icon={CheckCircle2}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
          <KPICard
            title="Avg Margin"
            value={`${margin}%`}
            icon={TrendingUp}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
          />
        </>
      ) : (
        <>
          <KPICard
            title="Total Earnings"
            value={`$${totalCost.toLocaleString()}`}
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100"
          />
          <KPICard
            title="Completed Loads"
            value={completedLoads}
            icon={CheckCircle2}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
          <KPICard
            title="Avg Rate"
            value={`$${avgRate}`}
            icon={TrendingUp}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
          />
        </>
      )}
    </div>
  );
}