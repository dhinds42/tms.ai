import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays } from "date-fns";

export default function InvoiceStats({ loads, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalInvoiced = loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalPaid = loads
    .filter(l => l.invoice_status === 'paid')
    .reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  
  const overdueInvoices = loads.filter(l => {
    if (l.invoice_status === 'paid' || !l.invoice_due_date) return false;
    const daysOverdue = differenceInDays(new Date(), new Date(l.invoice_due_date));
    return daysOverdue > 0;
  });

  const avgDSO = loads.filter(l => l.invoice_status === 'paid' && l.invoice_due_date).length > 0
    ? loads
        .filter(l => l.invoice_status === 'paid' && l.invoice_due_date)
        .reduce((sum, l) => {
          const days = differenceInDays(new Date(), new Date(l.invoice_due_date));
          return sum + Math.max(0, days);
        }, 0) / loads.filter(l => l.invoice_status === 'paid' && l.invoice_due_date).length
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Invoiced</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">${totalInvoiced.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Paid</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">${totalPaid.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Outstanding</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">${totalOutstanding.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg DSO</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{avgDSO.toFixed(0)} days</p>
              {overdueInvoices.length > 0 && (
                <p className="text-xs text-red-600 mt-1">{overdueInvoices.length} overdue</p>
              )}
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}