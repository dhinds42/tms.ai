import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CommissionsReport({ loads, drivers, ownerOperators, isLoading, operatingMode }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter delivered loads by date
  const filteredLoads = loads.filter(load => {
    if (load.status !== 'delivered') return false;
    
    const loadDate = new Date(load.actual_delivery || load.delivery_date || load.created_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    return (!start || loadDate >= start) && (!end || loadDate <= end);
  });

  // Calculate commissions
  const commissionsData = {};
  const allDrivers = [...drivers, ...ownerOperators];

  filteredLoads.forEach(load => {
    if (!load.driver_id) return;

    const driver = allDrivers.find(d => d.id === load.driver_id);
    if (!driver) return;

    const revenue = load.customer_rate || 0;
    let commission = 0;

    if (driver.payment_structure === 'percentage') {
      commission = revenue * ((driver.payment_rate || 0) / 100);
    } else if (driver.payment_structure === 'per_mile') {
      commission = (load.distance_miles || 0) * (driver.payment_rate || 0);
    } else if (driver.payment_structure === 'per_load') {
      commission = driver.payment_rate || 0;
    }

    if (!commissionsData[driver.id]) {
      commissionsData[driver.id] = {
        name: driver.full_name || driver.company_name,
        loads: 0,
        revenue: 0,
        commission: 0,
        payment_structure: driver.payment_structure,
        payment_rate: driver.payment_rate
      };
    }

    commissionsData[driver.id].loads += 1;
    commissionsData[driver.id].revenue += revenue;
    commissionsData[driver.id].commission += commission;
  });

  const commissionsList = Object.values(commissionsData).sort((a, b) => b.commission - a.commission);
  const totalCommissions = commissionsList.reduce((sum, c) => sum + c.commission, 0);

  // Export
  const handleExport = () => {
    const headers = ['Name', 'Loads', 'Revenue', 'Commission', 'Payment Structure', 'Rate'];
    const rows = commissionsList.map(c => [
      c.name,
      c.loads,
      c.revenue.toFixed(2),
      c.commission.toFixed(2),
      c.payment_structure,
      c.payment_rate
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Filters */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Commission Period</CardTitle>
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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase">Total Commissions</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">${totalCommissions.toLocaleString()}</p>
              </div>
              <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Active {operatingMode === 'carrier' ? 'Drivers' : 'Carriers'}</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{commissionsList.length}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Avg Commission</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              ${commissionsList.length > 0 ? (totalCommissions / commissionsList.length).toFixed(0) : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Commission by {operatingMode === 'carrier' ? 'Driver' : 'Carrier'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={commissionsList.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="commission" fill="#10b981" name="Commission" />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Commission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-center p-3 font-semibold">Loads</th>
                  <th className="text-right p-3 font-semibold">Revenue</th>
                  <th className="text-left p-3 font-semibold">Payment Structure</th>
                  <th className="text-right p-3 font-semibold">Rate</th>
                  <th className="text-right p-3 font-semibold">Commission</th>
                </tr>
              </thead>
              <tbody>
                {commissionsList.map((c, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-semibold">{c.name}</td>
                    <td className="p-3 text-center">{c.loads}</td>
                    <td className="p-3 text-right">${c.revenue.toLocaleString()}</td>
                    <td className="p-3 capitalize">{c.payment_structure?.replace('_', ' ')}</td>
                    <td className="p-3 text-right">
                      {c.payment_structure === 'percentage' ? `${c.payment_rate}%` : 
                       c.payment_structure === 'per_mile' ? `$${c.payment_rate}/mi` :
                       `$${c.payment_rate}/load`}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600">${c.commission.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td className="p-3 font-bold" colSpan="5">TOTAL</td>
                  <td className="p-3 text-right font-bold text-emerald-600 text-lg">${totalCommissions.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}