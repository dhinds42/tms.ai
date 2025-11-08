import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { DollarSign } from "lucide-react";

export default function PayrollSummary({ drivers, ownerOperators, loads, isLoading }) {
  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  // Calculate totals per driver/OO
  const driverEarnings = drivers.map(driver => {
    const driverLoads = loads.filter(l => l.driver_id === driver.id && l.status === 'delivered');
    return {
      name: driver.full_name,
      earnings: driverLoads.length * 500, // Simplified
      loads: driverLoads.length
    };
  }).filter(d => d.earnings > 0);

  const ooEarnings = ownerOperators.map(oo => {
    const ooLoads = loads.filter(l => l.driver_id === oo.id && l.status === 'delivered');
    const earnings = ooLoads.reduce((sum, l) => {
      const rate = oo.payment_rate || 75;
      return sum + ((l.carrier_pay || 0) * (rate / 100));
    }, 0);
    
    return {
      name: oo.full_name,
      earnings,
      loads: ooLoads.length
    };
  }).filter(o => o.earnings > 0);

  const totalDriverPay = driverEarnings.reduce((sum, d) => sum + d.earnings, 0);
  const totalOOPay = ooEarnings.reduce((sum, o) => sum + o.earnings, 0);

  const chartData = [
    { name: 'Company Drivers', value: totalDriverPay, color: '#3b82f6' },
    { name: 'Owner Operators', value: totalOOPay, color: '#8b5cf6' }
  ];

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2 text-xl">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Payroll Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Chart */}
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-2">Company Drivers</h4>
              <p className="text-2xl font-bold text-blue-600">${totalDriverPay.toLocaleString()}</p>
              <p className="text-sm text-slate-600 mt-1">{driverEarnings.length} drivers paid</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl">
              <h4 className="font-semibold text-purple-900 mb-2">Owner Operators</h4>
              <p className="text-2xl font-bold text-purple-600">${totalOOPay.toLocaleString()}</p>
              <p className="text-sm text-slate-600 mt-1">{ooEarnings.length} operators paid</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-300">
              <h4 className="font-semibold text-emerald-900 mb-2">Total Payroll</h4>
              <p className="text-3xl font-bold text-emerald-600">
                ${(totalDriverPay + totalOOPay).toLocaleString()}
              </p>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}