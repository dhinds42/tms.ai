import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Map, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LaneReport({ loads, isLoading, operatingMode }) {
  // Calculate lane data
  const laneData = {};
  
  loads.forEach(load => {
    const origin = `${load.pickup_location?.city}, ${load.pickup_location?.state}`;
    const destination = `${load.dropoff_location?.city}, ${load.dropoff_location?.state}`;
    const lane = `${origin} → ${destination}`;

    if (!laneData[lane]) {
      laneData[lane] = {
        lane,
        origin,
        destination,
        loads: 0,
        revenue: 0,
        cost: 0,
        margin: 0,
        avgRevenue: 0,
        avgMargin: 0,
        miles: load.distance_miles || 0
      };
    }

    laneData[lane].loads += 1;
    laneData[lane].revenue += load.customer_rate || 0;
    laneData[lane].cost += load.carrier_pay || 0;
    laneData[lane].margin += load.margin || 0;
  });

  // Calculate averages
  Object.values(laneData).forEach(lane => {
    lane.avgRevenue = lane.loads > 0 ? lane.revenue / lane.loads : 0;
    lane.avgMargin = lane.loads > 0 ? lane.margin / lane.loads : 0;
    lane.marginPercent = lane.revenue > 0 ? ((lane.margin / lane.revenue) * 100).toFixed(1) : 0;
  });

  const laneList = Object.values(laneData).sort((a, b) => b.revenue - a.revenue);
  const topLanes = laneList.slice(0, 20);

  // Export
  const handleExport = () => {
    const headers = ['Lane', 'Origin', 'Destination', 'Loads', 'Revenue', 'Cost', 'Margin', 'Avg Revenue', 'Avg Margin', 'Margin %'];
    const rows = laneList.map(l => [
      l.lane,
      l.origin,
      l.destination,
      l.loads,
      l.revenue.toFixed(2),
      l.cost.toFixed(2),
      l.margin.toFixed(2),
      l.avgRevenue.toFixed(2),
      l.avgMargin.toFixed(2),
      l.marginPercent
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lane-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Total stats
  const totalLanes = laneList.length;
  const totalRevenue = laneList.reduce((sum, l) => sum + l.revenue, 0);
  const totalMargin = laneList.reduce((sum, l) => sum + l.margin, 0);
  const avgLoadsPerLane = totalLanes > 0 ? loads.length / totalLanes : 0;

  return (
    <div className="space-y-6 mt-6">
      
      {/* Header */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              Lane Analysis Report
            </CardTitle>
            <Button onClick={handleExport} className="bg-emerald-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Lanes</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalLanes}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Revenue</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">${(totalRevenue / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Margin</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">${(totalMargin / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Avg Loads/Lane</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{avgLoadsPerLane.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Lanes Chart */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Top 20 Lanes by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={topLanes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="lane" type="category" width={200} fontSize={10} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              <Bar dataKey="margin" fill="#3b82f6" name="Margin" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Lane Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold">Origin</th>
                  <th className="text-left p-3 font-semibold">Destination</th>
                  <th className="text-center p-3 font-semibold">Loads</th>
                  <th className="text-right p-3 font-semibold">Revenue</th>
                  <th className="text-right p-3 font-semibold">Margin</th>
                  <th className="text-right p-3 font-semibold">Margin %</th>
                  <th className="text-right p-3 font-semibold">Avg Revenue</th>
                  <th className="text-center p-3 font-semibold">Performance</th>
                </tr>
              </thead>
              <tbody>
                {laneList.map((lane, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium text-xs">{lane.origin}</td>
                    <td className="p-3 font-medium text-xs">{lane.destination}</td>
                    <td className="p-3 text-center">{lane.loads}</td>
                    <td className="p-3 text-right font-semibold text-emerald-600">${lane.revenue.toLocaleString()}</td>
                    <td className="p-3 text-right font-semibold text-blue-600">${lane.margin.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold">{lane.marginPercent}%</td>
                    <td className="p-3 text-right">${lane.avgRevenue.toFixed(0)}</td>
                    <td className="p-3 text-center">
                      {lane.loads >= 10 ? (
                        <Badge className="bg-emerald-100 text-emerald-800">High Volume</Badge>
                      ) : lane.loads >= 5 ? (
                        <Badge className="bg-blue-100 text-blue-800">Medium</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-800">Low</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Lane Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-1">Top Performing Lanes</h4>
            <p className="text-sm text-slate-700">
              {topLanes.slice(0, 3).map(l => l.lane).join(' • ')}
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-1">High Margin Lanes</h4>
            <p className="text-sm text-slate-700">
              Focus on lanes with {'>'}20% margin for profitability growth
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-1">Opportunity Lanes</h4>
            <p className="text-sm text-slate-700">
              Consider increasing capacity on high-volume, high-margin lanes
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}