import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays } from "date-fns";
import { TrendingUp } from "lucide-react";

export default function InvoiceAgingChart({ invoices, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Calculate aging buckets
  const agingBuckets = {
    'Current (0-30)': 0,
    '31-60 Days': 0,
    '61-90 Days': 0,
    '90+ Days': 0
  };

  invoices
    .filter(inv => inv.invoice_status !== 'paid' && inv.invoice_due_date)
    .forEach(inv => {
      const daysOutstanding = differenceInDays(new Date(), new Date(inv.invoice_due_date));
      const amount = inv.customer_rate || 0;

      if (daysOutstanding <= 30) {
        agingBuckets['Current (0-30)'] += amount;
      } else if (daysOutstanding <= 60) {
        agingBuckets['31-60 Days'] += amount;
      } else if (daysOutstanding <= 90) {
        agingBuckets['61-90 Days'] += amount;
      } else {
        agingBuckets['90+ Days'] += amount;
      }
    });

  const chartData = Object.entries(agingBuckets).map(([bucket, amount]) => ({
    bucket,
    amount: Math.round(amount)
  }));

  const colors = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">Invoice Aging Analysis</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Outstanding amounts by aging bucket</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="bucket" 
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-4 gap-4">
          {chartData.map((bucket, index) => (
            <div key={bucket.bucket} className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: colors[index] }}></div>
              <p className="text-xs text-slate-600 mb-1">{bucket.bucket}</p>
              <p className="text-lg font-bold text-slate-900">${bucket.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}