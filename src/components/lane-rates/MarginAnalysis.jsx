import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function MarginAnalysis({ laneRates, isBroker }) {
  if (!isBroker) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">Margin analysis is only available to broker-level users</p>
      </div>
    );
  }

  // Calculate margin stats
  const totalRevenue = laneRates.reduce((sum, r) => sum + (r.customer_rate || 0), 0);
  const totalCost = laneRates.reduce((sum, r) => sum + (r.carrier_rate || 0), 0);
  const totalMargin = totalRevenue - totalCost;
  const avgMargin = (totalMargin / totalRevenue) * 100 || 0;

  // Top/bottom performing lanes
  const sortedByMargin = [...laneRates]
    .filter(r => r.margin_percentage)
    .sort((a, b) => b.margin_percentage - a.margin_percentage);
  
  const topLanes = sortedByMargin.slice(0, 5);
  const bottomLanes = sortedByMargin.slice(-5).reverse();

  // Chart data
  const chartData = topLanes.map(lane => ({
    name: `${lane.origin_city} → ${lane.destination_city}`,
    margin: lane.margin_percentage || 0
  }));

  return (
    <div className="space-y-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-blue-600">${totalCost.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 mb-1">Total Margin</p>
            <p className="text-2xl font-bold text-indigo-600">${totalMargin.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 mb-1">Avg Margin %</p>
            <p className="text-2xl font-bold text-purple-600">{avgMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Lanes Chart */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">Top 5 Lanes by Margin %</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={10} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="margin" fill="#6366f1">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.margin > 20 ? '#10b981' : entry.margin > 15 ? '#6366f1' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Top Performing Lanes
        </h3>
        <div className="space-y-2">
          {topLanes.map((lane, idx) => (
            <Card key={lane.id} className="border border-emerald-200 bg-emerald-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-600">#{idx + 1}</Badge>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {lane.origin_city}, {lane.origin_state} → {lane.destination_city}, {lane.destination_state}
                      </p>
                      <p className="text-xs text-slate-600">
                        Customer: ${lane.customer_rate?.toLocaleString()} | Carrier: ${lane.carrier_rate?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">{lane.margin_percentage?.toFixed(1)}%</p>
                    <p className="text-sm text-slate-600">${lane.total_margin?.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Performers */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-600" />
          Needs Improvement
        </h3>
        <div className="space-y-2">
          {bottomLanes.map((lane, idx) => (
            <Card key={lane.id} className="border border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {lane.origin_city}, {lane.origin_state} → {lane.destination_city}, {lane.destination_state}
                    </p>
                    <p className="text-xs text-slate-600">
                      Customer: ${lane.customer_rate?.toLocaleString()} | Carrier: ${lane.carrier_rate?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{lane.margin_percentage?.toFixed(1)}%</p>
                    <p className="text-sm text-slate-600">${lane.total_margin?.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}