import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export default function FuelSpendAnalysis({ loads }) {
  // Simulate weekly fuel spend
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const weeklyData = weeks.map((week, idx) => {
    const weekLoads = loads.slice(idx * 10, (idx + 1) * 10);
    const miles = weekLoads.reduce((sum, l) => sum + (l.distance_miles || 0), 0);
    const gallons = miles / 6.5;
    const cost = gallons * 3.85;

    return {
      week,
      spend: Math.round(cost)
    };
  });

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-xl">Weekly Fuel Spend Trend</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Fuel Spend']}
            />
            <Bar dataKey="spend" fill="url(#fuelGradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                <stop offset="100%" stopColor="#f97316" stopOpacity={1}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}