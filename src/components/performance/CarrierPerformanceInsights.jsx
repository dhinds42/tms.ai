import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Award, DollarSign, Clock, Shield, Target } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function CarrierPerformanceInsights({ carrier, loads }) {
  const carrierLoads = loads.filter(l => l.carrier_id === carrier.id);
  
  // Calculate trends over time (last 6 months)
  const getTrendData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        loads: 0,
        onTime: 0,
        revenue: 0,
        avgRate: 0
      });
    }

    carrierLoads.forEach(load => {
      const loadDate = new Date(load.created_date);
      const monthIndex = months.findIndex(m => {
        const mDate = new Date();
        mDate.setMonth(mDate.getMonth() - (5 - months.indexOf(m)));
        return loadDate.getMonth() === mDate.getMonth() && loadDate.getFullYear() === mDate.getFullYear();
      });

      if (monthIndex >= 0) {
        months[monthIndex].loads++;
        months[monthIndex].revenue += load.carrier_pay || 0;
        if (load.actual_delivery_datetime && load.planned_delivery_datetime) {
          if (new Date(load.actual_delivery_datetime) <= new Date(load.planned_delivery_datetime)) {
            months[monthIndex].onTime++;
          }
        }
      }
    });

    // Calculate percentages
    months.forEach(m => {
      m.onTimePercent = m.loads > 0 ? (m.onTime / m.loads) * 100 : 0;
      m.avgRate = m.loads > 0 ? m.revenue / m.loads : 0;
    });

    return months;
  };

  // Calculate key metrics
  const calculateMetrics = () => {
    const completedLoads = carrierLoads.filter(l => l.status === 'delivered');
    const recentLoads = completedLoads.slice(-30);
    
    const onTimeCount = recentLoads.filter(l => {
      if (!l.actual_delivery_datetime || !l.planned_delivery_datetime) return false;
      return new Date(l.actual_delivery_datetime) <= new Date(l.planned_delivery_datetime);
    }).length;

    const onTimePercent = recentLoads.length > 0 ? (onTimeCount / recentLoads.length) * 100 : 0;
    const avgRevenue = completedLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0) / Math.max(completedLoads.length, 1);
    const totalRevenue = completedLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
    
    // Calculate trend (last 30 days vs previous 30 days)
    const last30Loads = completedLoads.slice(-30);
    const prev30Loads = completedLoads.slice(-60, -30);
    
    const last30OnTime = last30Loads.filter(l => {
      if (!l.actual_delivery_datetime || !l.planned_delivery_datetime) return false;
      return new Date(l.actual_delivery_datetime) <= new Date(l.planned_delivery_datetime);
    }).length;
    
    const prev30OnTime = prev30Loads.filter(l => {
      if (!l.actual_delivery_datetime || !l.planned_delivery_datetime) return false;
      return new Date(l.actual_delivery_datetime) <= new Date(l.planned_delivery_datetime);
    }).length;

    const last30Percent = last30Loads.length > 0 ? (last30OnTime / last30Loads.length) * 100 : 0;
    const prev30Percent = prev30Loads.length > 0 ? (prev30OnTime / prev30Loads.length) * 100 : 0;
    const trend = last30Percent - prev30Percent;

    return {
      totalLoads: completedLoads.length,
      onTimePercent,
      avgRevenue,
      totalRevenue,
      trend,
      recentLoads: recentLoads.length
    };
  };

  const trendData = getTrendData();
  const metrics = calculateMetrics();

  // Performance tier
  const getTier = (score) => {
    if (score >= 95) return { label: 'Platinum', color: 'text-purple-700', bg: 'bg-purple-100' };
    if (score >= 90) return { label: 'Gold', color: 'text-yellow-700', bg: 'bg-yellow-100' };
    if (score >= 80) return { label: 'Silver', color: 'text-slate-700', bg: 'bg-slate-100' };
    if (score >= 70) return { label: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-100' };
    return { label: 'Needs Improvement', color: 'text-red-700', bg: 'bg-red-100' };
  };

  const tier = getTier(metrics.onTimePercent);

  return (
    <Card className="border-2 border-indigo-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Performance Insights - {carrier.company_name}
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge className={`${tier.bg} ${tier.color}`}>{tier.label} Tier</Badge>
          {metrics.trend > 0 ? (
            <Badge className="bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{metrics.trend.toFixed(1)}% Improving
            </Badge>
          ) : metrics.trend < 0 ? (
            <Badge className="bg-red-100 text-red-700">
              <TrendingDown className="w-3 h-3 mr-1" />
              {metrics.trend.toFixed(1)}% Declining
            </Badge>
          ) : (
            <Badge className="bg-slate-100 text-slate-700">Stable</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900">Total Loads</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{metrics.totalLoads}</p>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-900">On-Time %</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">{metrics.onTimePercent.toFixed(0)}%</p>
          </div>

          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-900">Avg Rate</span>
            </div>
            <p className="text-2xl font-bold text-indigo-700">${metrics.avgRevenue.toFixed(0)}</p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-900">Total Rev</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">${(metrics.totalRevenue / 1000).toFixed(0)}k</p>
          </div>
        </div>

        {/* Performance Trend Chart */}
        <Card className="border border-slate-200">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">6-Month Performance Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="onTimePercent" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="On-Time %" 
                  dot={{ fill: '#10b981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="loads" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  name="Loads" 
                  dot={{ fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend Chart */}
        <Card className="border border-slate-200">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData}>
                <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border border-indigo-200 bg-indigo-50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-indigo-900 mb-2">AI Recommendations:</p>
            <ul className="space-y-2 text-sm text-indigo-800">
              {metrics.onTimePercent >= 95 && (
                <li className="flex items-start gap-2">
                  <Award className="w-4 h-4 mt-0.5 text-indigo-600" />
                  <span>Excellent performer - consider premium lane assignments</span>
                </li>
              )}
              {metrics.trend > 5 && (
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-emerald-600" />
                  <span>Performance improving - increase load volume by 20%</span>
                </li>
              )}
              {metrics.trend < -5 && (
                <li className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 mt-0.5 text-red-600" />
                  <span>Performance declining - schedule review meeting</span>
                </li>
              )}
              {metrics.totalLoads < 10 && (
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 mt-0.5 text-blue-600" />
                  <span>New carrier - monitor performance closely for first 20 loads</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 mt-0.5 text-indigo-600" />
                <span>Maintain current capacity allocation based on consistent performance</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}