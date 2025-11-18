import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Award, Target, Zap, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PerformanceMetrics({ loads, carriers, drivers, operatingMode }) {
  // Calculate KPIs
  const deliveredLoads = loads.filter(l => l.status === 'delivered');
  const onTimeDeliveries = deliveredLoads.filter(l => l.delivery_on_time !== false).length;
  const onTimePercentage = deliveredLoads.length > 0 ? (onTimeDeliveries / deliveredLoads.length) * 100 : 0;
  
  const avgLoadValue = loads.length > 0 
    ? loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0) / loads.length 
    : 0;
  
  const activeCarrierCount = carriers.filter(c => c.status === 'active').length;
  const avgCarrierScore = carriers.length > 0
    ? carriers.reduce((sum, c) => sum + (c.performance_score || 0), 0) / carriers.length
    : 0;

  // Weekly performance trend
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const dayLoads = loads.filter(l => {
      const loadDate = new Date(l.created_date);
      return loadDate.toDateString() === date.toDateString();
    });
    
    return {
      day: dayName,
      loads: dayLoads.length,
      revenue: dayLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0) / 1000
    };
  });

  // Carrier performance distribution
  const carrierScoreData = [
    { range: '90-100', count: carriers.filter(c => (c.performance_score || 0) >= 90).length },
    { range: '80-89', count: carriers.filter(c => (c.performance_score || 0) >= 80 && (c.performance_score || 0) < 90).length },
    { range: '70-79', count: carriers.filter(c => (c.performance_score || 0) >= 70 && (c.performance_score || 0) < 80).length },
    { range: '60-69', count: carriers.filter(c => (c.performance_score || 0) >= 60 && (c.performance_score || 0) < 70).length },
    { range: '<60', count: carriers.filter(c => (c.performance_score || 0) < 60).length }
  ];

  return (
    <div className="space-y-6">
      
      {/* Performance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-600 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <Badge className={onTimePercentage >= 95 ? 'bg-emerald-600' : 'bg-amber-600'}>
                {onTimePercentage >= 95 ? 'Excellent' : 'Good'}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">On-Time Performance</p>
            <p className="text-3xl font-bold text-emerald-600">{onTimePercentage.toFixed(1)}%</p>
            <p className="text-xs text-slate-600 mt-2">
              {onTimeDeliveries} of {deliveredLoads.length} delivered on time
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Avg Load Value</p>
            <p className="text-3xl font-bold text-blue-600">${avgLoadValue.toFixed(0)}</p>
            <p className="text-xs text-slate-600 mt-2">
              Based on {loads.length} loads
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-600 rounded-xl">
                <Award className="w-6 h-6 text-white" />
              </div>
              <Badge className={avgCarrierScore >= 85 ? 'bg-emerald-600' : 'bg-amber-600'}>
                {avgCarrierScore >= 85 ? 'Strong' : 'Fair'}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Avg Carrier Score</p>
            <p className="text-3xl font-bold text-purple-600">{avgCarrierScore.toFixed(1)}</p>
            <p className="text-xs text-slate-600 mt-2">
              {activeCarrierCount} active carriers
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-600 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Load Velocity</p>
            <p className="text-3xl font-bold text-orange-600">{(loads.length / 30).toFixed(1)}</p>
            <p className="text-xs text-slate-600 mt-2">Loads per day (30-day avg)</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance Trend */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            7-Day Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b' }} />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="loads" stroke="#6366f1" strokeWidth={3} name="Loads" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue ($K)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Carrier Performance Distribution */}
      {operatingMode === 'broker' && (
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Carrier Performance Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={carrierScoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="range" tick={{ fill: '#64748b' }} />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

    </div>
  );
}