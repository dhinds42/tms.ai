import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertCircle, Target } from "lucide-react";
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";

export default function ProfitabilityAnalysis({ loads }) {
  // Lane profitability analysis
  const laneData = {};
  
  loads.forEach(load => {
    if (load.origin_city && load.destination_city) {
      const laneKey = `${load.origin_city} → ${load.destination_city}`;
      
      if (!laneData[laneKey]) {
        laneData[laneKey] = {
          lane: laneKey,
          loads: 0,
          revenue: 0,
          cost: 0,
          margin: 0
        };
      }
      
      laneData[laneKey].loads += 1;
      laneData[laneKey].revenue += (load.customer_rate || 0);
      laneData[laneKey].cost += (load.carrier_pay || 0);
      laneData[laneKey].margin += ((load.customer_rate || 0) - (load.carrier_pay || 0));
    }
  });

  const topLanesByMargin = Object.values(laneData)
    .map(lane => ({
      ...lane,
      marginPct: lane.revenue > 0 ? (lane.margin / lane.revenue) * 100 : 0,
      avgLoadValue: lane.loads > 0 ? lane.revenue / lane.loads : 0
    }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10);

  // Margin distribution scatter plot
  const scatterData = loads
    .filter(l => l.customer_rate && l.carrier_pay)
    .map(l => ({
      revenue: l.customer_rate,
      margin: ((l.customer_rate - l.carrier_pay) / l.customer_rate) * 100,
      volume: l.weight || 1000
    }));

  // Monthly profitability trend
  const monthlyProfit = {};
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
    monthlyProfit[monthKey] = { revenue: 0, cost: 0, margin: 0, marginPct: 0 };
  }

  loads.forEach(load => {
    if (load.created_date) {
      const loadDate = new Date(load.created_date);
      const monthKey = loadDate.toLocaleDateString('en-US', { month: 'short' });
      
      if (monthlyProfit[monthKey]) {
        const revenue = load.customer_rate || 0;
        const cost = load.carrier_pay || 0;
        monthlyProfit[monthKey].revenue += revenue;
        monthlyProfit[monthKey].cost += cost;
        monthlyProfit[monthKey].margin += (revenue - cost);
      }
    }
  });

  const profitTrendData = Object.keys(monthlyProfit).map(month => ({
    month,
    revenue: monthlyProfit[month].revenue,
    cost: monthlyProfit[month].cost,
    margin: monthlyProfit[month].margin,
    marginPct: monthlyProfit[month].revenue > 0 
      ? (monthlyProfit[month].margin / monthlyProfit[month].revenue) * 100 
      : 0
  }));

  const avgMargin = profitTrendData.reduce((sum, d) => sum + d.marginPct, 0) / profitTrendData.length;
  const totalProfit = loads.reduce((sum, l) => sum + ((l.customer_rate || 0) - (l.carrier_pay || 0)), 0);

  return (
    <div className="space-y-6">
      
      {/* Profitability Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-600 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Total Profit</p>
            <p className="text-3xl font-bold text-emerald-600">${(totalProfit / 1000).toFixed(1)}K</p>
            <p className="text-xs text-slate-600 mt-2">All-time gross profit</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <Badge className={avgMargin >= 15 ? 'bg-emerald-600' : avgMargin >= 10 ? 'bg-amber-600' : 'bg-red-600'}>
                {avgMargin >= 15 ? 'Strong' : avgMargin >= 10 ? 'Fair' : 'Weak'}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Avg Margin %</p>
            <p className="text-3xl font-bold text-blue-600">{avgMargin.toFixed(1)}%</p>
            <p className="text-xs text-slate-600 mt-2">6-month average</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-600 rounded-xl">
                <Award className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Best Performing Lane</p>
            <p className="text-lg font-bold text-purple-600">
              {topLanesByMargin[0]?.marginPct.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {topLanesByMargin[0]?.lane.split(' → ')[0]} → {topLanesByMargin[0]?.lane.split(' → ')[1]}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Profit Trend */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Monthly Profitability Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={profitTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fill: '#64748b' }} label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b' }} label={{ value: 'Margin %', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="cost" fill="#ef4444" name="Cost" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="marginPct" stroke="#6366f1" strokeWidth={3} name="Margin %" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Profitable Lanes */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Top 10 Lanes by Margin</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Lane</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Loads</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Revenue</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Margin</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Margin %</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {topLanesByMargin.map((lane, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{lane.lane}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900">{lane.loads}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-emerald-600">${lane.revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-blue-600">${lane.margin.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-purple-600">{lane.marginPct.toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge className={
                        lane.marginPct >= 20 ? 'bg-emerald-600' :
                        lane.marginPct >= 15 ? 'bg-blue-600' :
                        lane.marginPct >= 10 ? 'bg-amber-600' :
                        'bg-red-600'
                      }>
                        {lane.marginPct >= 20 ? 'Excellent' :
                         lane.marginPct >= 15 ? 'Good' :
                         lane.marginPct >= 10 ? 'Fair' :
                         'Poor'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Margin Distribution Scatter */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Load Margin Analysis - Revenue vs Margin %</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="revenue" name="Revenue" tick={{ fill: '#64748b' }} label={{ value: 'Load Revenue ($)', position: 'bottom' }} />
              <YAxis dataKey="margin" name="Margin %" tick={{ fill: '#64748b' }} label={{ value: 'Margin %', angle: -90, position: 'insideLeft' }} />
              <ZAxis dataKey="volume" range={[50, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Loads" data={scatterData} fill="#6366f1" />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-500 text-center mt-4">
            Bubble size represents load weight/volume
          </p>
        </CardContent>
      </Card>

    </div>
  );
}