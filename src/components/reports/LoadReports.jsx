import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Calendar, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function LoadReports({ loads, isLoading, operatingMode, drivers, carriers, shippers }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter loads by date range and status
  const filteredLoads = loads.filter(load => {
    const loadDate = new Date(load.created_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const dateMatch = (!start || loadDate >= start) && (!end || loadDate <= end);
    const statusMatch = selectedStatus === 'all' || load.status === selectedStatus;
    
    return dateMatch && statusMatch;
  });

  // Calculate metrics
  const totalLoads = filteredLoads.length;
  const totalRevenue = filteredLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalCost = filteredLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
  const totalMargin = totalRevenue - totalCost;
  const avgMargin = totalLoads > 0 ? totalMargin / totalLoads : 0;
  const marginPercent = totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(2) : 0;

  // Status breakdown
  const statusData = [
    { name: 'Available', count: filteredLoads.filter(l => l.status === 'available').length, color: '#6366f1' },
    { name: 'Dispatched', count: filteredLoads.filter(l => l.status === 'dispatched').length, color: '#8b5cf6' },
    { name: 'In Transit', count: filteredLoads.filter(l => l.status === 'in_transit').length, color: '#3b82f6' },
    { name: 'Delivered', count: filteredLoads.filter(l => l.status === 'delivered').length, color: '#10b981' },
    { name: 'Cancelled', count: filteredLoads.filter(l => l.status === 'cancelled').length, color: '#ef4444' }
  ];

  // Monthly revenue trend
  const monthlyData = {};
  filteredLoads.forEach(load => {
    const month = new Date(load.created_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) {
      monthlyData[month] = { month, revenue: 0, margin: 0, loads: 0 };
    }
    monthlyData[month].revenue += load.customer_rate || 0;
    monthlyData[month].margin += load.margin || 0;
    monthlyData[month].loads += 1;
  });
  const monthlyTrend = Object.values(monthlyData);

  // Top performers
  const performerData = {};
  if (operatingMode === 'carrier') {
    filteredLoads.forEach(load => {
      if (load.driver_id) {
        const driver = drivers.find(d => d.id === load.driver_id);
        if (driver) {
          if (!performerData[driver.id]) {
            performerData[driver.id] = { name: driver.full_name, revenue: 0, loads: 0 };
          }
          performerData[driver.id].revenue += load.customer_rate || 0;
          performerData[driver.id].loads += 1;
        }
      }
    });
  } else {
    filteredLoads.forEach(load => {
      if (load.carrier_id) {
        const carrier = carriers.find(c => c.id === load.carrier_id);
        if (carrier) {
          if (!performerData[carrier.id]) {
            performerData[carrier.id] = { name: carrier.company_name, revenue: 0, loads: 0 };
          }
          performerData[carrier.id].revenue += load.customer_rate || 0;
          performerData[carrier.id].loads += 1;
        }
      }
    });
  }
  const topPerformers = Object.values(performerData).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Export to CSV
  const handleExport = () => {
    const headers = ['Load Number', 'Date', 'Status', 'Origin', 'Destination', 'Revenue', 'Cost', 'Margin', 'Equipment'];
    const rows = filteredLoads.map(load => [
      load.load_number || `LOAD-${load.id.slice(0, 8)}`,
      new Date(load.created_date).toLocaleDateString(),
      load.status,
      `${load.pickup_location?.city}, ${load.pickup_location?.state}`,
      `${load.dropoff_location?.city}, ${load.dropoff_location?.state}`,
      load.customer_rate || 0,
      load.carrier_pay || 0,
      load.margin || 0,
      load.equipment_type
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `load-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Filters */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="dispatched">Dispatched</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleExport} className="w-full bg-emerald-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Loads</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalLoads}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Revenue</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">${(totalRevenue / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Cost</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">${(totalCost / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-blue-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Margin</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">${(totalMargin / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Margin %</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{marginPercent}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Breakdown */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Load Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Monthly Revenue & Margin Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="margin" stroke="#3b82f6" strokeWidth={2} name="Margin" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Top Performers */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Top {operatingMode === 'carrier' ? 'Drivers' : 'Carriers'} by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topPerformers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#6366f1" name="Revenue" />
              <Bar dataKey="loads" fill="#8b5cf6" name="Loads" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Load Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold">Load #</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Route</th>
                  <th className="text-right p-3 font-semibold">Revenue</th>
                  <th className="text-right p-3 font-semibold">Cost</th>
                  <th className="text-right p-3 font-semibold">Margin</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoads.slice(0, 50).map(load => (
                  <tr key={load.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-mono text-xs">{load.load_number || `LOAD-${load.id.slice(0, 8)}`}</td>
                    <td className="p-3">{new Date(load.created_date).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        load.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        load.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {load.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs">
                      {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
                    </td>
                    <td className="p-3 text-right font-semibold text-emerald-600">${(load.customer_rate || 0).toLocaleString()}</td>
                    <td className="p-3 text-right font-semibold text-purple-600">${(load.carrier_pay || 0).toLocaleString()}</td>
                    <td className="p-3 text-right font-semibold text-blue-600">${(load.margin || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLoads.length > 50 && (
              <p className="text-center text-sm text-slate-500 mt-4">
                Showing first 50 of {filteredLoads.length} loads. Export to CSV for full report.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}