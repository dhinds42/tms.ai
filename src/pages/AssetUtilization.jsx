import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

import UtilizationAnalytics from "../components/asset-utilization/UtilizationAnalytics";

export default function AssetUtilization() {
  const utilizationData = [
    { name: 'In Use', value: 78, color: '#10b981' },
    { name: 'Idle', value: 15, color: '#f59e0b' },
    { name: 'Maintenance', value: 7, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
            Asset Utilization Analytics
          </h1>
          <p className="text-slate-600 mt-2">Track equipment and container utilization</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Assets</p>
                  <p className="text-3xl font-bold text-slate-900">247</p>
                </div>
                <Truck className="w-12 h-12 text-slate-900 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Utilization Rate</p>
                  <p className="text-3xl font-bold text-emerald-600">78%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Idle Assets</p>
                  <p className="text-3xl font-bold text-amber-600">37</p>
                </div>
                <Package className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Maintenance</p>
                  <p className="text-3xl font-bold text-red-600">17</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Asset Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={utilizationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {utilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Underutilized Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Trailer #1234', 'Trailer #5678', 'Container #9012'].map((asset, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="font-semibold text-amber-900">{asset}</span>
                    <Badge className="bg-amber-600">Idle 5 days</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <UtilizationAnalytics />

      </div>
    </div>
  );
}