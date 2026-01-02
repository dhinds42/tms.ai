import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import AdvancedFinancialAnalytics from "../components/analytics/AdvancedFinancialAnalytics";
import AIPredictiveAnalytics from "../components/analytics/AIPredictiveAnalytics";
import DynamicInsightsEngine from "../components/analytics/DynamicInsightsEngine";
import PredictiveLoadForecasting from "../components/forecasting/PredictiveLoadForecasting";
import AdvancedFinancialMetrics from "../components/financial/AdvancedFinancialMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PageHeader, StandardTabs } from "@/components/design-system";
import {
  TrendingUp,
  DollarSign,
  Truck,
  Users,
  BarChart2,
  PieChart as PieChartIcon,
  Download,
  Calendar,
  Search,
  Lightbulb,
  Zap,
  Target,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const { data: loads, isLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 1000),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 500),
    initialData: [],
  });

  const { data: shippers } = useQuery({
    queryKey: ['shippers'],
    queryFn: () => base44.entities.Shipper.list('-created_date', 500),
    initialData: [],
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 500),
    initialData: [],
  });

  // Filter loads by date range
  const filteredLoads = loads.filter(l => {
    const loadDate = new Date(l.created_date);
    return loadDate >= new Date(dateRange.start) && loadDate <= new Date(dateRange.end);
  });

  // Calculate KPIs
  const totalRevenue = filteredLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalCosts = filteredLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
  const totalMargin = totalRevenue - totalCosts;
  const marginPercent = totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(2) : 0;
  const avgLoadValue = filteredLoads.length > 0 ? (totalRevenue / filteredLoads.length).toFixed(0) : 0;

  // Revenue by Month
  const revenueByMonth = {};
  filteredLoads.forEach(load => {
    const month = new Date(load.created_date).toLocaleDateString('en-US', { month: 'short' });
    if (!revenueByMonth[month]) {
      revenueByMonth[month] = { month, revenue: 0, costs: 0, margin: 0 };
    }
    revenueByMonth[month].revenue += load.customer_rate || 0;
    revenueByMonth[month].costs += load.carrier_pay || 0;
    revenueByMonth[month].margin += (load.customer_rate || 0) - (load.carrier_pay || 0);
  });
  const revenueData = Object.values(revenueByMonth);

  // Top Customers
  const customerRevenue = {};
  filteredLoads.forEach(load => {
    const shipper = shippers.find(s => s.id === load.shipper_id);
    const name = shipper?.company_name || 'Unknown';
    if (!customerRevenue[name]) {
      customerRevenue[name] = 0;
    }
    customerRevenue[name] += load.customer_rate || 0;
  });
  const topCustomers = Object.entries(customerRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  // Top Carriers
  const carrierSpend = {};
  filteredLoads.forEach(load => {
    const carrier = carriers.find(c => c.id === load.carrier_id);
    const name = carrier?.company_name || 'Unknown';
    if (!carrierSpend[name]) {
      carrierSpend[name] = 0;
    }
    carrierSpend[name] += load.carrier_pay || 0;
  });
  const topCarriers = Object.entries(carrierSpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  // Equipment Type Distribution
  const equipmentDist = {};
  filteredLoads.forEach(load => {
    const type = load.equipment_type || 'unknown';
    equipmentDist[type] = (equipmentDist[type] || 0) + 1;
  });
  const equipmentData = Object.entries(equipmentDist).map(([name, value]) => ({ name, value }));

  // Load Status Distribution
  const statusDist = {};
  filteredLoads.forEach(load => {
    const status = load.status || 'unknown';
    statusDist[status] = (statusDist[status] || 0) + 1;
  });
  const statusData = Object.entries(statusDist).map(([name, value]) => ({ name, value }));

  // Top Lanes
  const laneRevenue = {};
  filteredLoads.forEach(load => {
    const lane = `${load.pickup_location?.city || '?'}, ${load.pickup_location?.state || '?'} → ${load.dropoff_location?.city || '?'}, ${load.dropoff_location?.state || '?'}`;
    if (!laneRevenue[lane]) {
      laneRevenue[lane] = { revenue: 0, count: 0 };
    }
    laneRevenue[lane].revenue += load.customer_rate || 0;
    laneRevenue[lane].count += 1;
  });
  const topLanes = Object.entries(laneRevenue)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)
    .map(([name, data]) => ({ name, revenue: data.revenue, count: data.count }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const handleExport = () => {
    const csv = `Metric,Value
Total Revenue,${totalRevenue}
Total Costs,${totalCosts}
Total Margin,${totalMargin}
Margin %,${marginPercent}
Total Loads,${filteredLoads.length}
Avg Load Value,${avgLoadValue}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${dateRange.start}_${dateRange.end}.csv`;
    a.click();
  };

  // Calculate trend indicators (simulated for demo)
  const revenueTrend = 12.5;
  const marginTrend = 8.3;
  const loadsTrend = 15.2;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Analytics"
        subtitle="Business intelligence and performance metrics"
        icon={BarChart2}
        primaryAction={{
          label: 'Export',
          icon: Download,
          onClick: handleExport
        }}
        modeBadge={operatingMode.toUpperCase()}
      />
      
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Date Range */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-3 flex gap-3">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="flex-1 h-9 px-3 border border-slate-300 rounded-lg text-sm"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="flex-1 h-9 px-3 border border-slate-300 rounded-lg text-sm"
            />
          </CardContent>
        </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">${(totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-500">Revenue</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">${(totalMargin / 1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-500">Margin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600">{filteredLoads.length}</p>
                <p className="text-xs text-slate-500">Loads</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600">${avgLoadValue}</p>
                <p className="text-xs text-slate-500">Avg Load</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-cyan-600">{marginPercent}%</p>
                <p className="text-xs text-slate-500">Margin %</p>
              </div>
            </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-4">

        {/* Charts */}
        <StandardTabs
          tabs={[
            { key: 'revenue', label: 'Revenue', icon: DollarSign },
            { key: 'customers', label: 'Customers', icon: Users },
            { key: 'carriers', label: 'Carriers', icon: Truck },
            { key: 'lanes', label: 'Lanes', icon: TrendingUp },
            { key: 'equipment', label: 'Equipment', icon: null },
            { key: 'status', label: 'Status', icon: null }
          ]}
          activeTab="revenue"
          onTabChange={() => {}}
        />
        
        <Tabs defaultValue="revenue">
          <TabsList className="hidden"></TabsList>

          {/* Revenue Trends */}
          <TabsContent value="revenue">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Revenue, Costs & Margin Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" name="Revenue" />
                    <Area type="monotone" dataKey="costs" stackId="2" stroke="#ef4444" fill="#ef4444" name="Costs" />
                    <Area type="monotone" dataKey="margin" stackId="3" stroke="#3b82f6" fill="#3b82f6" name="Margin" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Customers */}
          <TabsContent value="customers">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top 10 Customers by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCustomers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="value" fill="#3b82f6" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Carriers */}
          <TabsContent value="carriers">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top 10 Carriers by Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCarriers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="value" fill="#10b981" name="Spend" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Lanes */}
          <TabsContent value="lanes">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top 10 Lanes by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {topLanes.slice(0, 6).map((lane, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{lane.name}</p>
                        <p className="text-xs text-slate-600">{lane.count} loads</p>
                      </div>
                      <p className="text-lg font-bold text-emerald-600">${lane.revenue.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Equipment Mix */}
          <TabsContent value="equipment">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Equipment Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={equipmentData} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                      {equipmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Load Status */}
          <TabsContent value="status">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Load Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            
            {/* Dynamic Insights Engine */}
            <DynamicInsightsEngine loads={filteredLoads} carriers={carriers} drivers={drivers} />
            
            {/* Advanced Financial Metrics */}
            <AdvancedFinancialMetrics loads={filteredLoads} customers={shippers} />

            {/* Predictive Load Forecasting */}
            <PredictiveLoadForecasting loads={filteredLoads} />

            {/* AI Predictive Analytics */}
            <AIPredictiveAnalytics loads={filteredLoads} carriers={carriers} drivers={drivers} />
            
            {/* Advanced Financial Analytics */}
            <AdvancedFinancialAnalytics loads={filteredLoads} />
            
            {/* AI Recommendations */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-indigo-800">
                  <Lightbulb className="w-4 h-4" /> AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {marginPercent < 15 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ Margin Compression</p>
                    <p className="text-xs text-amber-700">Current margin {marginPercent}%. Consider: (1) Renegotiate carrier rates, (2) Increase customer rates by 3-5%, (3) Focus on high-margin lanes</p>
                  </div>
                )}
                {topLanes.length > 0 && topLanes[0].revenue > 50000 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-900 mb-1">🎯 Top Lane Opportunity</p>
                    <p className="text-xs text-emerald-700">{topLanes[0].name} generated ${(topLanes[0].revenue / 1000).toFixed(0)}K. Secure dedicated capacity here for ${(topLanes[0].revenue * 0.15 / 1000).toFixed(0)}K additional margin.</p>
                  </div>
                )}
                {filteredLoads.length > 50 && avgLoadValue < 1000 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 mb-1">💰 Load Consolidation</p>
                    <p className="text-xs text-blue-700">Avg load value only ${avgLoadValue}. Bundle 2-3 smaller loads per truck to reduce cost per mile by 18-22%.</p>
                  </div>
                )}
                {topCarriers.length > 0 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                    <p className="text-xs font-semibold text-purple-900 mb-1">🤝 Carrier Relationship</p>
                    <p className="text-xs text-purple-700">You spent ${(topCarriers[0].value / 1000).toFixed(0)}K with {topCarriers[0].name}. Negotiate volume discount for 5-8% cost reduction.</p>
                  </div>
                )}
                {filteredLoads.filter(l => l.status === 'cancelled').length > 5 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-red-100">
                    <p className="text-xs font-semibold text-red-900 mb-1">🚫 Cancellation Pattern</p>
                    <p className="text-xs text-red-700">{filteredLoads.filter(l => l.status === 'cancelled').length} cancelled loads detected. Review customer contracts for TONU clauses.</p>
                  </div>
                )}
                {revenueData.length > 2 && revenueData[revenueData.length - 1].revenue > revenueData[revenueData.length - 2].revenue * 1.2 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-cyan-100">
                    <p className="text-xs font-semibold text-cyan-900 mb-1">📈 Capacity Surge</p>
                    <p className="text-xs text-cyan-700">Revenue spiked 20%+ this period. Proactively recruit 2-3 carriers before next peak to avoid rate inflation.</p>
                  </div>
                )}
                <div className="p-3 bg-white/80 rounded-lg border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-900 mb-1">🔍 Data Quality Check</p>
                  <p className="text-xs text-indigo-700">{filteredLoads.filter(l => !l.customer_rate || !l.carrier_pay).length} loads missing rate data. Clean data = better forecasts.</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" /> Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Margin Target (15%)</span>
                    <span className="font-medium">{marginPercent}%</span>
                  </div>
                  <Progress value={Math.min(Number(marginPercent) / 15 * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Load Capacity</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">On-Time Delivery</span>
                    <span className="font-medium text-emerald-600">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2 text-blue-600" /> Export Report
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <RefreshCw className="w-4 h-4 mr-2 text-emerald-600" /> Refresh Data
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Calendar className="w-4 h-4 mr-2 text-purple-600" /> Schedule Report
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Target className="w-4 h-4 mr-2 text-amber-600" /> Set KPI Goals
                </Button>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" /> Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-2">
                <p>• Review analytics weekly for trends</p>
                <p>• Focus on high-margin lanes</p>
                <p>• Monitor carrier performance</p>
                <p>• Track customer profitability</p>
                <p>• Set monthly revenue targets</p>
                <p>• Export reports for stakeholders</p>
              </CardContent>
            </Card>

            {/* Period Summary */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                  <TrendingUp className="w-4 h-4" /> Period Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Revenue</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-emerald-700">${(totalRevenue / 1000).toFixed(0)}K</span>
                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Margin</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-blue-700">${(totalMargin / 1000).toFixed(0)}K</span>
                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Total Loads</span>
                  <span className="font-bold text-purple-700">{filteredLoads.length}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}