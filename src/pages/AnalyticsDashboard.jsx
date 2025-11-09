import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  DollarSign,
  Truck,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Calendar
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 mt-2">
              Comprehensive business intelligence and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2">
              {operatingMode === 'carrier' ? 'Carrier Mode' : 'Broker Mode'}
            </Badge>
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Date Range Selector */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-slate-600" />
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    ${(totalRevenue / 1000).toFixed(0)}K
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Total Margin</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    ${(totalMargin / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{marginPercent}%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Total Loads</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {filteredLoads.length}
                  </p>
                </div>
                <Truck className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Avg Load Value</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    ${avgLoadValue}
                  </p>
                </div>
                <BarChart3 className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
            <TabsTrigger value="customers">Top Customers</TabsTrigger>
            <TabsTrigger value="carriers">Top Carriers</TabsTrigger>
            <TabsTrigger value="lanes">Top Lanes</TabsTrigger>
            <TabsTrigger value="equipment">Equipment Mix</TabsTrigger>
            <TabsTrigger value="status">Load Status</TabsTrigger>
          </TabsList>

          {/* Revenue Trends */}
          <TabsContent value="revenue">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Revenue, Costs & Margin Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Top 10 Customers by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCustomers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="value" fill="#3b82f6" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Carriers */}
          <TabsContent value="carriers">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Top 10 Carriers by Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCarriers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="value" fill="#10b981" name="Spend" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Lanes */}
          <TabsContent value="lanes">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Top 10 Lanes by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLanes.map((lane, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{lane.name}</p>
                        <p className="text-sm text-slate-600">{lane.count} loads</p>
                      </div>
                      <p className="text-xl font-bold text-emerald-600">
                        ${lane.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Equipment Mix */}
          <TabsContent value="equipment">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Equipment Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={equipmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Load Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
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
    </div>
  );
}