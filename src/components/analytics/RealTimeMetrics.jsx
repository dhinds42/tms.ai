import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, Truck, DollarSign } from "lucide-react";

export default function RealTimeMetrics() {
  const metrics = [
    { label: 'Active Loads', value: 147, change: '+12', trend: 'up', icon: Truck, color: 'blue' },
    { label: 'Today\'s Revenue', value: '$45.2K', change: '+8%', trend: 'up', icon: DollarSign, color: 'emerald' },
    { label: 'Avg Load Time', value: '2.4 days', change: '-0.3', trend: 'down', icon: Activity, color: 'purple' },
    { label: 'Margin %', value: '18.5%', change: '+2.1%', trend: 'up', icon: TrendingUp, color: 'amber' }
  ];

  const liveActivity = [
    { time: '2 min ago', event: 'Load #12345 delivered', type: 'success' },
    { time: '5 min ago', event: 'New carrier onboarded: ABC Transport', type: 'info' },
    { time: '8 min ago', event: 'Load #12340 delayed - ETA +30min', type: 'warning' },
    { time: '12 min ago', event: 'Invoice #INV-5678 paid', type: 'success' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-600 animate-pulse" />
          Real-Time Metrics Dashboard
          <Badge className="ml-2 bg-red-600">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className={`p-4 bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-100 rounded-lg border border-${metric.color}-200`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 text-${metric.color}-600`} />
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mb-1">{metric.label}</p>
                <p className={`text-2xl font-bold text-${metric.color}-600`}>{metric.value}</p>
                <p className="text-xs text-emerald-600 mt-1">{metric.change}</p>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Live Activity Feed
          </h4>
          <div className="space-y-2">
            {liveActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2 bg-white rounded border-l-2 border-l-slate-300">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  activity.type === 'success' ? 'bg-emerald-600' :
                  activity.type === 'warning' ? 'bg-amber-600' :
                  'bg-blue-600'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{activity.event}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}