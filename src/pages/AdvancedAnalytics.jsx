import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, DollarSign, Truck, Users, Package, Target, Award } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2">
              Advanced Analytics Dashboard
            </h1>
            <p className="text-slate-600">
              Comprehensive business intelligence and performance metrics
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2">
            Real-time Data
          </Badge>
        </div>

        {/* Tabbed Analytics View */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="performance">🎯 Performance</TabsTrigger>
            <TabsTrigger value="profitability">💰 Profitability</TabsTrigger>
            <TabsTrigger value="trends">📈 Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">

        {/* Advanced Filters */}
        <AdvancedAnalyticsFilters
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onDeleteFilter={handleDeleteFilter}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    ${(totalRevenue / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Margin</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    ${(totalMargin / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{avgMarginPct.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Loads</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{filteredLoads.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {operatingMode === 'broker' ? 'Active Carriers' : 'Active Drivers'}
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {operatingMode === 'broker' ? carriers.length : drivers.length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-6">
            <CardTitle>Revenue & Margin Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue ($)" />
                <Line type="monotone" dataKey="margin" stroke="#6366f1" strokeWidth={3} name="Margin ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Equipment & Status Distribution */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100 pb-6">
              <CardTitle>Equipment Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={equipmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {equipmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100 pb-6">
              <CardTitle>Load Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100 pb-6">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Top 10 Shippers by Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topShippers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {operatingMode === 'broker' && (
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="border-b border-slate-100 pb-6">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Top 10 Carriers by Load Volume
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCarriers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="loads" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="border-b border-slate-100">
                <CardTitle>Revenue & Load Volume Trend</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                    <YAxis yAxisId="left" tick={{ fill: '#64748b' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue ($)" />
                    <Line yAxisId="right" type="monotone" dataKey="loads" stroke="#6366f1" strokeWidth={3} name="Load Count" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}