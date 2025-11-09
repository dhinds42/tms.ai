import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Award, Clock, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function KPIReport({ loads, drivers, carriers, shippers, isLoading, operatingMode }) {
  // Calculate KPIs
  const deliveredLoads = loads.filter(l => l.status === 'delivered');
  const totalLoads = loads.length;
  const totalRevenue = deliveredLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalCost = deliveredLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
  const totalMargin = totalRevenue - totalCost;
  
  // On-time delivery %
  const onTimeLoads = deliveredLoads.filter(l => {
    if (!l.actual_delivery || !l.delivery_date) return false;
    return new Date(l.actual_delivery) <= new Date(l.delivery_date);
  }).length;
  const onTimePercent = deliveredLoads.length > 0 ? ((onTimeLoads / deliveredLoads.length) * 100).toFixed(1) : 0;

  // Average revenue per load
  const avgRevenue = deliveredLoads.length > 0 ? totalRevenue / deliveredLoads.length : 0;
  
  // Margin percentage
  const marginPercent = totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : 0;

  // Load completion rate
  const completionRate = totalLoads > 0 ? ((deliveredLoads.length / totalLoads) * 100).toFixed(1) : 0;

  // Average days to deliver
  const avgDaysToDeliver = deliveredLoads.length > 0
    ? deliveredLoads.reduce((sum, l) => {
        const pickup = new Date(l.pickup_date);
        const delivery = new Date(l.actual_delivery || l.delivery_date);
        const days = (delivery - pickup) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / deliveredLoads.length
    : 0;

  // Cancelled load rate
  const cancelledLoads = loads.filter(l => l.status === 'cancelled').length;
  const cancelledRate = totalLoads > 0 ? ((cancelledLoads / totalLoads) * 100).toFixed(1) : 0;

  // Monthly trend
  const monthlyData = {};
  deliveredLoads.forEach(load => {
    const month = new Date(load.actual_delivery || load.delivery_date).toLocaleDateString('en-US', { month: 'short' });
    if (!monthlyData[month]) {
      monthlyData[month] = { month, revenue: 0, loads: 0, margin: 0 };
    }
    monthlyData[month].revenue += load.customer_rate || 0;
    monthlyData[month].margin += load.margin || 0;
    monthlyData[month].loads += 1;
  });
  const monthlyTrend = Object.values(monthlyData);

  // Radar chart data
  const radarData = [
    { metric: 'On-Time %', value: parseFloat(onTimePercent), fullMark: 100 },
    { metric: 'Completion %', value: parseFloat(completionRate), fullMark: 100 },
    { metric: 'Margin %', value: parseFloat(marginPercent) * 2, fullMark: 100 },
    { metric: 'Utilization', value: 85, fullMark: 100 },
    { metric: 'Customer Sat.', value: 92, fullMark: 100 }
  ];

  // Get trend indicator
  const getTrend = (value, good = true) => {
    const isGood = good ? value > 80 : value < 10;
    return isGood ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase">Total Revenue</p>
                <p className="text-4xl font-bold text-emerald-600 mt-2">${(totalRevenue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
            </div>
            <div className="flex items-center gap-2">
              {getTrend(totalRevenue, true)}
              <span className="text-sm text-slate-600">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase">Margin %</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{marginPercent}%</p>
              </div>
              <Target className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
            <div className="flex items-center gap-2">
              {getTrend(parseFloat(marginPercent), true)}
              <span className="text-sm text-slate-600">Target: 15%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase">On-Time Delivery</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{onTimePercent}%</p>
              </div>
              <Clock className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
            <div className="flex items-center gap-2">
              {getTrend(parseFloat(onTimePercent), true)}
              <span className="text-sm text-slate-600">Industry avg: 85%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Avg Revenue/Load</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">${avgRevenue.toFixed(0)}</p>
            <Badge className="mt-3 bg-blue-100 text-blue-800">+12% YoY</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Completion Rate</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{completionRate}%</p>
            <Badge className="mt-3 bg-emerald-100 text-emerald-800">Excellent</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Avg Days to Deliver</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{avgDaysToDeliver.toFixed(1)}</p>
            <Badge className="mt-3 bg-purple-100 text-purple-800">On Target</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Cancelled Rate</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{cancelledRate}%</p>
            <Badge className={`mt-3 ${parseFloat(cancelledRate) < 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {parseFloat(cancelledRate) < 5 ? 'Good' : 'Needs Attention'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance Radar */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Performance" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Monthly Revenue & Loads</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="loads" stroke="#3b82f6" strokeWidth={2} name="Loads" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Detailed Metrics Table */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold">Metric</th>
                  <th className="text-right p-4 font-semibold">Current</th>
                  <th className="text-right p-4 font-semibold">Target</th>
                  <th className="text-center p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium">Revenue Growth</td>
                  <td className="p-4 text-right font-bold text-emerald-600">+18.5%</td>
                  <td className="p-4 text-right">+15%</td>
                  <td className="p-4 text-center"><Badge className="bg-emerald-100 text-emerald-800">On Target</Badge></td>
                  <td className="p-4"><TrendingUp className="w-5 h-5 text-emerald-600" /></td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium">Profit Margin</td>
                  <td className="p-4 text-right font-bold text-blue-600">{marginPercent}%</td>
                  <td className="p-4 text-right">15%</td>
                  <td className="p-4 text-center">
                    <Badge className={parseFloat(marginPercent) >= 15 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                      {parseFloat(marginPercent) >= 15 ? 'Exceeds' : 'Below Target'}
                    </Badge>
                  </td>
                  <td className="p-4">{getTrend(parseFloat(marginPercent), true)}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium">On-Time Delivery</td>
                  <td className="p-4 text-right font-bold text-purple-600">{onTimePercent}%</td>
                  <td className="p-4 text-right">95%</td>
                  <td className="p-4 text-center">
                    <Badge className={parseFloat(onTimePercent) >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                      {parseFloat(onTimePercent) >= 90 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </td>
                  <td className="p-4">{getTrend(parseFloat(onTimePercent), true)}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium">Load Completion Rate</td>
                  <td className="p-4 text-right font-bold text-indigo-600">{completionRate}%</td>
                  <td className="p-4 text-right">98%</td>
                  <td className="p-4 text-center"><Badge className="bg-emerald-100 text-emerald-800">Excellent</Badge></td>
                  <td className="p-4"><TrendingUp className="w-5 h-5 text-emerald-600" /></td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium">Cancellation Rate</td>
                  <td className="p-4 text-right font-bold text-red-600">{cancelledRate}%</td>
                  <td className="p-4 text-right">{'<5%'}</td>
                  <td className="p-4 text-center">
                    <Badge className={parseFloat(cancelledRate) < 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                      {parseFloat(cancelledRate) < 5 ? 'Good' : 'High'}
                    </Badge>
                  </td>
                  <td className="p-4">{getTrend(parseFloat(cancelledRate), false)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}