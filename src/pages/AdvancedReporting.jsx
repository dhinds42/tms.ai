import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Truck, Clock, Download } from "lucide-react";

export default function AdvancedReporting() {
  const [dateRange, setDateRange] = useState('30d');

  const { data: loads = [] } = useScopedEntity('Load', { limit: 1000 });
  const { data: carriers = [] } = useScopedEntity('Carrier', { limit: 200 });
  const { data: drivers = [] } = useScopedEntity('Driver', { limit: 200 });

  // Customer Profitability Analysis
  const customerProfitability = loads.reduce((acc, load) => {
    if (!load.customer_id || !load.customer_rate) return acc;
    
    const revenue = parseFloat(load.customer_rate) || 0;
    const cost = parseFloat(load.carrier_pay) || 0;
    const netProfit = revenue - cost - (revenue * 0.15); // 15% overhead
    
    if (!acc[load.customer_id]) {
      acc[load.customer_id] = {
        customer_id: load.customer_id,
        loads: 0,
        revenue: 0,
        cost: 0,
        netProfit: 0
      };
    }
    
    acc[load.customer_id].loads++;
    acc[load.customer_id].revenue += revenue;
    acc[load.customer_id].cost += cost;
    acc[load.customer_id].netProfit += netProfit;
    
    return acc;
  }, {});

  const customerReport = Object.values(customerProfitability)
    .map(c => ({
      ...c,
      marginPercent: c.revenue > 0 ? ((c.netProfit / c.revenue) * 100) : 0
    }))
    .sort((a, b) => b.netProfit - a.netProfit)
    .slice(0, 10);

  // Carrier Utilization Report
  const carrierUtilization = carriers.map(carrier => {
    const carrierLoads = loads.filter(l => l.carrier_id === carrier.id);
    const completedLoads = carrierLoads.filter(l => l.status === 'delivered').length;
    const totalAssigned = carrierLoads.length;
    const utilizationRate = totalAssigned > 0 ? (completedLoads / totalAssigned) * 100 : 0;
    
    return {
      name: carrier.company_name,
      utilization: utilizationRate,
      loads: totalAssigned,
      completed: completedLoads
    };
  }).sort((a, b) => b.utilization - a.utilization).slice(0, 10);

  // Lane Density Analysis
  const laneDensity = loads.reduce((acc, load) => {
    if (!load.pickup_location?.state || !load.dropoff_location?.state) return acc;
    
    const lane = `${load.pickup_location.state} → ${load.dropoff_location.state}`;
    if (!acc[lane]) {
      acc[lane] = { lane, count: 0, revenue: 0 };
    }
    acc[lane].count++;
    acc[lane].revenue += parseFloat(load.customer_rate) || 0;
    
    return acc;
  }, {});

  const laneReport = Object.values(laneDensity)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Equipment ROI
  const equipmentROI = loads.reduce((acc, load) => {
    if (!load.equipment_type) return acc;
    
    const revenue = parseFloat(load.customer_rate) || 0;
    const cost = parseFloat(load.carrier_pay) || 0;
    const profit = revenue - cost;
    
    if (!acc[load.equipment_type]) {
      acc[load.equipment_type] = { type: load.equipment_type, loads: 0, revenue: 0, profit: 0 };
    }
    
    acc[load.equipment_type].loads++;
    acc[load.equipment_type].revenue += revenue;
    acc[load.equipment_type].profit += profit;
    
    return acc;
  }, {});

  const equipmentReport = Object.values(equipmentROI)
    .map(e => ({
      ...e,
      roi: e.revenue > 0 ? ((e.profit / e.revenue) * 100) : 0,
      avgProfitPerLoad: e.loads > 0 ? (e.profit / e.loads) : 0
    }))
    .sort((a, b) => b.roi - a.roi);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Advanced Reporting</h1>
            <p className="text-slate-600 mt-1">Strategic insights for data-driven decisions</p>
          </div>
          <Button className="bg-indigo-600">
            <Download className="w-4 h-4 mr-2" />
            Export All Reports
          </Button>
        </div>

        <Tabs defaultValue="profitability" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profitability">Customer P&L</TabsTrigger>
            <TabsTrigger value="utilization">Carrier Utilization</TabsTrigger>
            <TabsTrigger value="lanes">Lane Density</TabsTrigger>
            <TabsTrigger value="equipment">Equipment ROI</TabsTrigger>
          </TabsList>

          {/* Customer Profitability */}
          <TabsContent value="profitability" className="space-y-4">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Customer Profitability Ranking (Top 10)
                  <Badge className="ml-auto">Net Margin After 15% Overhead</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="customer_id" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="netProfit" fill="#10b981" name="Net Profit" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-6 space-y-2">
                  {customerReport.map((customer, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-slate-900">#{i + 1}</div>
                        <div>
                          <p className="font-semibold text-slate-900">{customer.customer_id}</p>
                          <p className="text-xs text-slate-600">{customer.loads} loads</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">${customer.netProfit.toLocaleString()}</p>
                        <p className="text-xs text-slate-600">{customer.marginPercent.toFixed(1)}% margin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Carrier Utilization */}
          <TabsContent value="utilization" className="space-y-4">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Carrier Utilization Rate
                  <Badge className="ml-auto">Completed / Total Assigned</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={carrierUtilization}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {carrierUtilization.map((carrier, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-slate-900 mb-1">{carrier.name}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Utilization:</span>
                        <span className={`font-bold ${carrier.utilization >= 80 ? 'text-green-600' : carrier.utilization >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                          {carrier.utilization.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{carrier.completed} / {carrier.loads} loads</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lane Density */}
          <TabsContent value="lanes" className="space-y-4">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Lane Density Heatmap
                  <Badge className="ml-auto">Where to Recruit Drivers</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={laneReport} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="lane" type="category" width={100} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value, name) => name === 'count' ? `${value} loads` : `$${value.toLocaleString()}`} />
                    <Bar dataKey="count" fill="#8b5cf6" name="Load Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Equipment ROI */}
          <TabsContent value="equipment" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base">Equipment Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={equipmentReport} dataKey="loads" nameKey="type" cx="50%" cy="50%" outerRadius={80}>
                        {equipmentReport.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base">ROI by Equipment Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {equipmentReport.map((equip, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900">{equip.type}</span>
                          <span className="text-sm font-bold text-indigo-600">{equip.roi.toFixed(1)}% ROI</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>{equip.loads} loads</span>
                          <span>${equip.avgProfitPerLoad.toFixed(0)} avg profit/load</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}