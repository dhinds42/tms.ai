import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ShipperDashboard({ loads }) {
  const avgRate = loads.length > 0
    ? loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0) / loads.length
    : 0;

  const onTimePercentage = loads.length > 0
    ? (loads.filter(l => l.status === 'delivered' && (!l.actual_delivery || new Date(l.actual_delivery) <= new Date(l.delivery_date))).length / loads.filter(l => l.status === 'delivered').length) * 100
    : 100;

  // Simple trend data
  const trendData = [
    { month: 'Jan', loads: 12, spend: 18000 },
    { month: 'Feb', loads: 15, spend: 22500 },
    { month: 'Mar', loads: 18, spend: 27000 },
    { month: 'Apr', loads: loads.length, spend: loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0) }
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-6">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Shipping Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="loads" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="border-b border-blue-200 pb-6">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Clock className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl">
              <p className="text-sm text-slate-600 mb-1">Average Rate</p>
              <p className="text-3xl font-bold text-blue-600">${avgRate.toFixed(0)}</p>
            </div>
            <div className="p-4 bg-white rounded-xl">
              <p className="text-sm text-slate-600 mb-1">On-Time Delivery</p>
              <p className="text-3xl font-bold text-emerald-600">{onTimePercentage.toFixed(0)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}