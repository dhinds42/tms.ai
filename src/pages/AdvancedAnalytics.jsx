import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Truck, Users, Package, Target, Award, BarChart2, Lightbulb, Zap, Download, RefreshCw, Activity, ArrowUpRight, PieChart as PieChartIcon } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PageHeader, StandardTabs } from "@/components/design-system";
import PerformanceMetrics from "../components/analytics/PerformanceMetrics";
import ProfitabilityAnalysis from "../components/analytics/ProfitabilityAnalysis";
import AdvancedAnalyticsFilters, { applyFiltersToData } from "../components/analytics/AdvancedAnalyticsFilters";

export default function AdvancedAnalytics() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [filterConfig, setFilterConfig] = useState(null);
  const [savedFilters, setSavedFilters] = useState(() => {
    const saved = localStorage.getItem('analytics_saved_filters');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 500),
    initialData: [],
  });

  const { data: shippers } = useQuery({
    queryKey: ['shippers'],
    queryFn: () => base44.entities.Shipper.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  // Apply filters to loads
  const filteredLoads = useMemo(() => {
    if (!filterConfig) return loads;
    return applyFiltersToData(loads, filterConfig);
  }, [loads, filterConfig]);

  const handleFilterChange = (config) => {
    setFilterConfig(config);
  };

  const handleSaveFilter = (filter) => {
    const newFilters = [...savedFilters, filter];
    setSavedFilters(newFilters);
    localStorage.setItem('analytics_saved_filters', JSON.stringify(newFilters));
  };

  const handleDeleteFilter = (index) => {
    const newFilters = savedFilters.filter((_, i) => i !== index);
    setSavedFilters(newFilters);
    localStorage.setItem('analytics_saved_filters', JSON.stringify(newFilters));
  };

  const handleExport = () => {
    const csvData = filteredLoads.map(load => ({
      load_number: load.load_number || load.id,
      status: load.status,
      pickup_city: load.pickup_location?.city,
      pickup_state: load.pickup_location?.state,
      delivery_city: load.dropoff_location?.city,
      delivery_state: load.dropoff_location?.state,
      customer_rate: load.customer_rate,
      carrier_pay: load.carrier_pay,
      margin: load.margin,
      equipment_type: load.equipment_type,
      pickup_date: load.pickup_date,
      delivery_date: load.delivery_date
    }));
    
    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Revenue Analysis (using filtered loads)
  const totalRevenue = filteredLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalCosts = filteredLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
  const totalMargin = totalRevenue - totalCosts;
  const avgMarginPct = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

  // Monthly Revenue Trend (last 6 months)
  const getMonthlyData = () => {
    const monthlyData = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = { revenue: 0, loads: 0, margin: 0 };
    }

    filteredLoads.forEach(load => {
      if (load.created_date) {
        const loadDate = new Date(load.created_date);
        const monthKey = loadDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].revenue += (load.customer_rate || 0);
          monthlyData[monthKey].margin += (load.margin || 0);
          monthlyData[monthKey].loads += 1;
        }
      }
    });

    return Object.keys(monthlyData).map(month => ({
      month,
      revenue: monthlyData[month].revenue,
      margin: monthlyData[month].margin,
      loads: monthlyData[month].loads
    }));
  };

  // Equipment Type Distribution
  const equipmentData = {};
  filteredLoads.forEach(load => {
    const equipment = load.equipment_type || 'unknown';
    equipmentData[equipment] = (equipmentData[equipment] || 0) + 1;
  });

  const equipmentChartData = Object.keys(equipmentData).map(key => ({
    name: key.replace(/_/g, ' ').toUpperCase(),
    value: equipmentData[key]
  }));

  // Load Status Distribution
  const statusData = {};
  filteredLoads.forEach(load => {
    const status = load.status || 'unknown';
    statusData[status] = (statusData[status] || 0) + 1;
  });

  const statusChartData = Object.keys(statusData).map(key => ({
    name: key.replace(/_/g, ' ').toUpperCase(),
    value: statusData[key]
  }));

  // Top Shippers by Revenue
  const shipperRevenue = {};
  filteredLoads.forEach(load => {
    if (load.shipper_id) {
      shipperRevenue[load.shipper_id] = (shipperRevenue[load.shipper_id] || 0) + (load.customer_rate || 0);
    }
  });

  const topShippers = Object.keys(shipperRevenue)
    .map(id => {
      const shipper = shippers.find(s => s.id === id);
      return {
        name: shipper?.company_name || 'Unknown',
        revenue: shipperRevenue[id]
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Top Carriers by Performance
  const carrierPerformance = {};
  filteredLoads.forEach(load => {
    if (load.carrier_id) {
      if (!carrierPerformance[load.carrier_id]) {
        carrierPerformance[load.carrier_id] = { loads: 0, revenue: 0 };
      }
      carrierPerformance[load.carrier_id].loads += 1;
      carrierPerformance[load.carrier_id].revenue += (load.carrier_pay || 0);
    }
  });

  const topCarriers = Object.keys(carrierPerformance)
    .map(id => {
      const carrier = carriers.find(c => c.id === id);
      return {
        name: carrier?.company_name || 'Unknown',
        loads: carrierPerformance[id].loads,
        revenue: carrierPerformance[id].revenue
      };
    })
    .sort((a, b) => b.loads - a.loads)
    .slice(0, 10);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#84cc16'];

  const monthlyData = getMonthlyData();

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Advanced Analytics"
        subtitle="Comprehensive business intelligence and performance metrics"
        icon={BarChart2}
        primaryAction={{
          label: 'Export',
          icon: Download,
          onClick: handleExport
        }}
        modeBadge={operatingMode.toUpperCase()}
      />
      
      <div className="max-w-6xl mx-auto p-6 space-y-6">

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
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-indigo-600">${(totalMargin / 1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-500">Margin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{filteredLoads.length}</p>
                <p className="text-xs text-slate-500">Loads</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600">{operatingMode === 'broker' ? carriers.length : drivers.length}</p>
                <p className="text-xs text-slate-500">{operatingMode === 'broker' ? 'Carriers' : 'Drivers'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-cyan-600">{avgMarginPct.toFixed(1)}%</p>
                <p className="text-xs text-slate-500">Margin %</p>
              </div>
            </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-4">

        {/* Tabbed Analytics View */}
        <StandardTabs
          tabs={[
            { key: 'overview', label: 'Overview', icon: BarChart2 },
            { key: 'performance', label: 'Performance', icon: TrendingUp },
            { key: 'profitability', label: 'Profitability', icon: DollarSign },
            { key: 'trends', label: 'Trends', icon: Activity }
          ]}
          activeTab="overview"
          onTabChange={() => {}}
        />
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="hidden"></TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">

        {/* Advanced Filters */}
        <AdvancedAnalyticsFilters
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onDeleteFilter={handleDeleteFilter}
        />

        {/* Revenue Trend */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revenue & Margin Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="margin" stroke="#6366f1" strokeWidth={2} name="Margin" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Equipment & Status Distribution */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Equipment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={equipmentChartData} cx="50%" cy="50%" outerRadius={70} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {equipmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Load Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Shippers */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" /> Top Shippers by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topShippers.slice(0, 5).map((shipper, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700 truncate flex-1">{shipper.name}</span>
                  <span className="text-sm font-bold text-emerald-600">${(shipper.revenue / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <PerformanceMetrics 
              loads={filteredLoads} 
              carriers={carriers} 
              drivers={drivers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Profitability Tab */}
          <TabsContent value="profitability">
            <ProfitabilityAnalysis loads={filteredLoads} />
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Revenue & Load Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                    <Line yAxisId="right" type="monotone" dataKey="loads" stroke="#6366f1" strokeWidth={2} name="Loads" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            
            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-800">
                  <Lightbulb className="w-4 h-4" /> AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {avgMarginPct < 15 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ Margin Alert</p>
                    <p className="text-xs text-amber-700">Margin at {avgMarginPct.toFixed(1)}%. Target 15%+ for healthy ops.</p>
                  </div>
                )}
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">📊 Data Quality</p>
                  <p className="text-xs text-purple-700">{filteredLoads.length} loads analyzed across {Object.keys(statusChartData).length} statuses.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">🎯 Top Lane Focus</p>
                  <p className="text-xs text-purple-700">Top 5 lanes generate 80% of revenue. Prioritize capacity there.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">📈 Growth Tip</p>
                  <p className="text-xs text-purple-700">Review underperforming carriers quarterly to optimize costs.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">✅ Best Practice</p>
                  <p className="text-xs text-emerald-700">Export weekly reports for stakeholder reviews.</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" /> Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Margin Target (15%)</span>
                    <span className="font-medium">{avgMarginPct.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(avgMarginPct / 15 * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Load Capacity</span>
                    <span className="font-medium">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">On-Time Rate</span>
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
                  <Target className="w-4 h-4 mr-2 text-purple-600" /> Set KPI Goals
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Award className="w-4 h-4 mr-2 text-amber-600" /> View Scorecards
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
                <p>• Benchmark against industry</p>
              </CardContent>
            </Card>

            {/* Period Summary */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                  <TrendingUp className="w-4 h-4" /> Summary
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
                  <span className="font-bold text-indigo-700">${(totalMargin / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Total Loads</span>
                  <span className="font-bold text-blue-700">{filteredLoads.length}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}