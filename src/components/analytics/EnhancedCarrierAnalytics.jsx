import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Award, AlertTriangle, DollarSign, Truck } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function EnhancedCarrierAnalytics({ carrierId, timeWindow = '30d' }) {
  const { data: carrier } = useQuery({
    queryKey: ['carrier', carrierId],
    queryFn: async () => {
      const carriers = await base44.entities.Carrier.filter({ id: carrierId });
      return carriers[0];
    }
  });

  const { data: loads } = useQuery({
    queryKey: ['carrierLoads', carrierId],
    queryFn: () => base44.entities.Load.filter({ carrier_id: carrierId }),
    initialData: []
  });

  const { data: escalations } = useQuery({
    queryKey: ['carrierEscalations', carrierId],
    queryFn: async () => {
      const drivers = await base44.entities.Driver.filter({ party_id: carrierId });
      const driverIds = drivers.map(d => d.id);
      const allEscalations = await base44.entities.DriverEscalation.list('-created_date', 500);
      return allEscalations.filter(e => driverIds.includes(e.driver_id));
    },
    initialData: []
  });

  // Time window filter
  const cutoffDate = new Date();
  if (timeWindow === '7d') cutoffDate.setDate(cutoffDate.getDate() - 7);
  if (timeWindow === '30d') cutoffDate.setDate(cutoffDate.getDate() - 30);
  if (timeWindow === '90d') cutoffDate.setDate(cutoffDate.getDate() - 90);

  const windowLoads = loads.filter(l => new Date(l.created_date) >= cutoffDate);
  const completedLoads = windowLoads.filter(l => l.status === 'delivered');
  
  const onTimeLoads = completedLoads.filter(l => 
    l.actual_delivery_datetime && l.planned_delivery_datetime &&
    new Date(l.actual_delivery_datetime) <= new Date(l.planned_delivery_datetime)
  );

  const metrics = {
    total_loads: windowLoads.length,
    completed_loads: completedLoads.length,
    on_time_pct: completedLoads.length > 0 
      ? Math.round((onTimeLoads.length / completedLoads.length) * 100)
      : 0,
    completion_rate: windowLoads.length > 0
      ? Math.round((completedLoads.length / windowLoads.length) * 100)
      : 0,
    dispute_rate: completedLoads.length > 0
      ? Math.round((escalations.length / completedLoads.length) * 100)
      : 0,
    avg_margin: completedLoads.length > 0
      ? Math.round(completedLoads.reduce((sum, l) => {
          const revenue = l.customer_rate_cents || 0;
          const cost = l.carrier_rate_cents || 0;
          return sum + ((revenue - cost) / revenue * 100);
        }, 0) / completedLoads.length)
      : 0
  };

  // Trend analysis (compare to previous period)
  const previousCutoff = new Date(cutoffDate);
  previousCutoff.setDate(previousCutoff.getDate() - (timeWindow === '7d' ? 7 : timeWindow === '30d' ? 30 : 90));
  
  const previousLoads = loads.filter(l => {
    const date = new Date(l.created_date);
    return date >= previousCutoff && date < cutoffDate;
  });
  
  const prevCompleted = previousLoads.filter(l => l.status === 'delivered');
  const prevOnTime = prevCompleted.filter(l =>
    l.actual_delivery_datetime && l.planned_delivery_datetime &&
    new Date(l.actual_delivery_datetime) <= new Date(l.planned_delivery_datetime)
  );
  
  const trends = {
    loads: previousLoads.length > 0 
      ? ((windowLoads.length - previousLoads.length) / previousLoads.length * 100)
      : 0,
    on_time: prevCompleted.length > 0
      ? (((onTimeLoads.length / completedLoads.length) - (prevOnTime.length / prevCompleted.length)) * 100)
      : 0
  };

  // Weekly performance chart data
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const weekLoads = loads.filter(l => {
      const date = new Date(l.created_date);
      return date >= weekStart && date < weekEnd;
    }).filter(l => l.status === 'delivered');
    
    const weekOnTime = weekLoads.filter(l =>
      l.actual_delivery_datetime && l.planned_delivery_datetime &&
      new Date(l.actual_delivery_datetime) <= new Date(l.planned_delivery_datetime)
    );
    
    weeklyData.push({
      week: `Week ${7-i}`,
      loads: weekLoads.length,
      on_time_pct: weekLoads.length > 0 ? Math.round((weekOnTime.length / weekLoads.length) * 100) : 0
    });
  }

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Total Loads</p>
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{metrics.total_loads}</p>
            {trends.loads !== 0 && (
              <div className="flex items-center gap-1 mt-1">
                {trends.loads > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-xs ${trends.loads > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(Math.round(trends.loads))}% vs prev
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">On-Time Rate</p>
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{metrics.on_time_pct}%</p>
            <Progress value={metrics.on_time_pct} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Avg Margin</p>
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-indigo-600">{metrics.avg_margin}%</p>
            {metrics.avg_margin >= 15 ? (
              <Badge className="mt-1 bg-green-500 text-xs">Healthy</Badge>
            ) : (
              <Badge className="mt-1 bg-amber-500 text-xs">Monitor</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Dispute Rate</p>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{metrics.dispute_rate}%</p>
            {metrics.dispute_rate < 5 ? (
              <Badge className="mt-1 bg-green-500 text-xs">Excellent</Badge>
            ) : metrics.dispute_rate < 10 ? (
              <Badge className="mt-1 bg-amber-500 text-xs">Watch</Badge>
            ) : (
              <Badge className="mt-1 bg-red-500 text-xs">Action Needed</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>7-Week Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="loads" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Loads"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="on_time_pct" 
                stroke="#10b981" 
                strokeWidth={2}
                name="On-Time %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Indicators */}
      {(metrics.dispute_rate > 10 || metrics.on_time_pct < 85 || metrics.avg_margin < 10) && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Risk Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.dispute_rate > 10 && (
              <div className="p-3 bg-white rounded border border-red-200">
                <p className="text-sm font-semibold text-red-900">High Dispute Rate</p>
                <p className="text-xs text-red-700">
                  {metrics.dispute_rate}% exceeds 10% threshold. Review driver training and policy compliance.
                </p>
              </div>
            )}
            {metrics.on_time_pct < 85 && (
              <div className="p-3 bg-white rounded border border-amber-200">
                <p className="text-sm font-semibold text-amber-900">Low On-Time Performance</p>
                <p className="text-xs text-amber-700">
                  {metrics.on_time_pct}% below 85% standard. Consider route optimization or capacity adjustments.
                </p>
              </div>
            )}
            {metrics.avg_margin < 10 && (
              <div className="p-3 bg-white rounded border border-orange-200">
                <p className="text-sm font-semibold text-orange-900">Margin Pressure</p>
                <p className="text-xs text-orange-700">
                  {metrics.avg_margin}% margin below 10%. Review pricing strategy and cost controls.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}