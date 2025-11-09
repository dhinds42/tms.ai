import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, DollarSign, FileText } from "lucide-react";

export default function GLReport({ loads, shippers, carriers, operatingMode }) {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Calculate GL entries
  const filteredLoads = loads.filter(l => {
    const loadDate = new Date(l.created_date);
    return loadDate >= new Date(dateRange.start) && loadDate <= new Date(dateRange.end);
  });

  const revenue = filteredLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const cogs = filteredLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
  const grossProfit = revenue - cogs;
  const marginPercent = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(2) : 0;

  // GL Accounts
  const glAccounts = [
    { account: '4000', name: 'Revenue - Freight', debit: 0, credit: revenue },
    { account: '5000', name: 'COGS - Carrier Payments', debit: cogs, credit: 0 },
    { account: '1200', name: 'Accounts Receivable', debit: revenue, credit: 0 },
    { account: '2000', name: 'Accounts Payable', debit: 0, credit: cogs },
    { account: '3000', name: 'Gross Profit', debit: 0, credit: grossProfit }
  ];

  const handleExportGL = () => {
    const csv = glAccounts.map(gl => 
      `${gl.account},${gl.name},${gl.debit},${gl.credit}`
    ).join('\n');
    
    const blob = new Blob([`Account,Name,Debit,Credit\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gl_report_${dateRange.start}_${dateRange.end}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* GL Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  ${(revenue / 1000).toFixed(1)}K
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">COGS</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  ${(cogs / 1000).toFixed(1)}K
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Gross Profit</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ${(grossProfit / 1000).toFixed(1)}K
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Margin %</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {marginPercent}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range */}
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
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
            <Button onClick={handleExportGL} className="bg-indigo-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export GL
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* GL Account List */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>General Ledger Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 font-semibold text-slate-900">Account</th>
                  <th className="text-left p-3 font-semibold text-slate-900">Account Name</th>
                  <th className="text-right p-3 font-semibold text-slate-900">Debit</th>
                  <th className="text-right p-3 font-semibold text-slate-900">Credit</th>
                  <th className="text-right p-3 font-semibold text-slate-900">Balance</th>
                </tr>
              </thead>
              <tbody>
                {glAccounts.map((gl, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-mono text-sm">{gl.account}</td>
                    <td className="p-3">{gl.name}</td>
                    <td className="p-3 text-right font-semibold text-emerald-600">
                      {gl.debit > 0 ? `$${gl.debit.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-3 text-right font-semibold text-red-600">
                      {gl.credit > 0 ? `$${gl.credit.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-3 text-right font-bold">
                      ${Math.abs(gl.debit - gl.credit).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}