import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ARAPReport({ loads, shippers, carriers, isLoading, operatingMode }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter loads by date
  const filteredLoads = loads.filter(load => {
    const loadDate = new Date(load.created_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || loadDate >= start) && (!end || loadDate <= end);
  });

  // Calculate AR (Accounts Receivable) - money owed TO us
  const arLoads = filteredLoads.filter(l => 
    l.invoice_status && ['sent', 'partial', 'overdue'].includes(l.invoice_status)
  );
  const totalAR = arLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const overdueAR = arLoads.filter(l => {
    if (!l.invoice_due_date) return false;
    return new Date(l.invoice_due_date) < new Date() && l.invoice_status === 'overdue';
  }).reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const currentAR = totalAR - overdueAR;

  // Calculate AP (Accounts Payable) - money we owe
  const apLoads = filteredLoads.filter(l => l.status === 'delivered' && l.carrier_pay > 0);
  const totalAP = apLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);

  // AR Aging buckets
  const arAging = {
    current: 0,
    '1-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90+': 0
  };

  arLoads.forEach(load => {
    if (!load.invoice_due_date) {
      arAging.current += load.customer_rate || 0;
      return;
    }
    
    const daysOverdue = Math.floor((new Date() - new Date(load.invoice_due_date)) / (1000 * 60 * 60 * 24));
    
    if (daysOverdue <= 0) arAging.current += load.customer_rate || 0;
    else if (daysOverdue <= 30) arAging['1-30'] += load.customer_rate || 0;
    else if (daysOverdue <= 60) arAging['31-60'] += load.customer_rate || 0;
    else if (daysOverdue <= 90) arAging['61-90'] += load.customer_rate || 0;
    else arAging['90+'] += load.customer_rate || 0;
  });

  const agingData = [
    { name: 'Current', value: arAging.current, color: '#10b981' },
    { name: '1-30 Days', value: arAging['1-30'], color: '#3b82f6' },
    { name: '31-60 Days', value: arAging['31-60'], color: '#f59e0b' },
    { name: '61-90 Days', value: arAging['61-90'], color: '#ef4444' },
    { name: '90+ Days', value: arAging['90+'], color: '#dc2626' }
  ];

  // Top customers by AR
  const customerAR = {};
  arLoads.forEach(load => {
    const shipper = shippers.find(s => s.id === load.shipper_id);
    const name = shipper?.company_name || 'Unknown';
    if (!customerAR[name]) customerAR[name] = 0;
    customerAR[name] += load.customer_rate || 0;
  });
  const topCustomers = Object.entries(customerAR)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Top carriers by AP
  const carrierAP = {};
  apLoads.forEach(load => {
    const carrier = carriers.find(c => c.id === load.carrier_id);
    const name = carrier?.company_name || 'Unknown';
    if (!carrierAP[name]) carrierAP[name] = 0;
    carrierAP[name] += load.carrier_pay || 0;
  });
  const topCarriers = Object.entries(carrierAP)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Export
  const handleExport = () => {
    const headers = ['Type', 'Customer/Carrier', 'Load', 'Date', 'Due Date', 'Amount', 'Status', 'Days Overdue'];
    const arRows = arLoads.map(l => {
      const shipper = shippers.find(s => s.id === l.shipper_id);
      const daysOverdue = l.invoice_due_date ? Math.floor((new Date() - new Date(l.invoice_due_date)) / (1000 * 60 * 60 * 24)) : 0;
      return [
        'AR',
        shipper?.company_name || 'Unknown',
        l.load_number || l.id.slice(0, 8),
        new Date(l.created_date).toLocaleDateString(),
        l.invoice_due_date ? new Date(l.invoice_due_date).toLocaleDateString() : 'N/A',
        l.customer_rate || 0,
        l.invoice_status,
        daysOverdue > 0 ? daysOverdue : 0
      ];
    });

    const apRows = apLoads.map(l => {
      const carrier = carriers.find(c => c.id === l.carrier_id);
      return [
        'AP',
        carrier?.company_name || 'Unknown',
        l.load_number || l.id.slice(0, 8),
        new Date(l.created_date).toLocaleDateString(),
        'N/A',
        l.carrier_pay || 0,
        'Due',
        0
      ];
    });

    const csv = [headers.join(','), ...arRows.map(r => r.join(',')), ...apRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ar-ap-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Filters */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total AR</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">${totalAR.toLocaleString()}</p>
            <Badge className="mt-3 bg-emerald-100 text-emerald-800">{arLoads.length} invoices</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Current AR</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">${currentAR.toLocaleString()}</p>
            <Badge className="mt-3 bg-blue-100 text-blue-800">Not Overdue</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Overdue AR</p>
            <p className="text-3xl font-bold text-red-600 mt-2">${overdueAR.toLocaleString()}</p>
            <Badge className="mt-3 bg-red-100 text-red-800">Action Needed</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total AP</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">${totalAP.toLocaleString()}</p>
            <Badge className="mt-3 bg-purple-100 text-purple-800">{apLoads.length} payables</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AR Aging */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>AR Aging Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agingData.filter(d => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: $${(entry.value / 1000).toFixed(0)}K`}
                >
                  {agingData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Customers by AR */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Top Customers by AR</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Top Carriers by AP */}
      {operatingMode === 'broker' && (
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Top Carriers by AP</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCarriers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed AR Table */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Accounts Receivable Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold">Customer</th>
                  <th className="text-left p-3 font-semibold">Load #</th>
                  <th className="text-left p-3 font-semibold">Invoice Date</th>
                  <th className="text-left p-3 font-semibold">Due Date</th>
                  <th className="text-right p-3 font-semibold">Amount</th>
                  <th className="text-center p-3 font-semibold">Status</th>
                  <th className="text-center p-3 font-semibold">Days</th>
                </tr>
              </thead>
              <tbody>
                {arLoads.slice(0, 50).map(load => {
                  const shipper = shippers.find(s => s.id === load.shipper_id);
                  const daysOverdue = load.invoice_due_date ? 
                    Math.max(0, Math.floor((new Date() - new Date(load.invoice_due_date)) / (1000 * 60 * 60 * 24))) : 
                    0;
                  
                  return (
                    <tr key={load.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-medium">{shipper?.company_name || 'Unknown'}</td>
                      <td className="p-3 font-mono text-xs">{load.load_number || load.id.slice(0, 8)}</td>
                      <td className="p-3">{new Date(load.created_date).toLocaleDateString()}</td>
                      <td className="p-3">
                        {load.invoice_due_date ? new Date(load.invoice_due_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        ${(load.customer_rate || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={
                          load.invoice_status === 'overdue' ? 'bg-red-100 text-red-800' :
                          load.invoice_status === 'partial' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {load.invoice_status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        {daysOverdue > 0 && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {daysOverdue}d
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {arLoads.length > 50 && (
              <p className="text-center text-sm text-slate-500 mt-4">
                Showing first 50 of {arLoads.length} AR items. Export to CSV for full report.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}