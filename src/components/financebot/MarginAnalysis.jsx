import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function MarginAnalysis({ loads, avgMargin }) {
  // Margin distribution
  const marginBuckets = {
    'High (>20%)': 0,
    'Target (15-20%)': 0,
    'Low (10-15%)': 0,
    'Very Low (<10%)': 0
  };

  loads.forEach(load => {
    if (!load.customer_rate || !load.carrier_pay) return;
    const margin = ((load.customer_rate - load.carrier_pay) / load.customer_rate) * 100;
    
    if (margin > 20) marginBuckets['High (>20%)']++;
    else if (margin >= 15) marginBuckets['Target (15-20%)']++;
    else if (margin >= 10) marginBuckets['Low (10-15%)']++;
    else marginBuckets['Very Low (<10%)']++;
  });

  const chartData = Object.entries(marginBuckets).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl font-bold text-slate-900">
          Margin Distribution
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Breakdown of loads by margin percentage
        </p>
      </CardHeader>
      <CardContent className="pt-6">
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-6 p-4 bg-indigo-50 rounded-xl text-center">
          <p className="text-sm text-slate-600 mb-1">Average Margin</p>
          <p className="text-3xl font-bold text-indigo-600">{avgMargin}%</p>
        </div>
      </CardContent>
    </Card>
  );
}