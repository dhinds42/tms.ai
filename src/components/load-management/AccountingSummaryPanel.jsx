import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, AlertCircle, Download, CheckCircle2 } from "lucide-react";

export default function AccountingSummaryPanel({ loads }) {
  // Calculate financial metrics
  const totalRevenue = loads.reduce((sum, l) => sum + (l.total_revenue || l.customer_rate || 0), 0);
  const totalCost = loads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0);
  const totalMargin = totalRevenue - totalCost;
  const marginPercentage = totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : 0;

  const invoicedLoads = loads.filter(l => l.invoice_status === 'sent' || l.invoice_status === 'paid');
  const paidLoads = loads.filter(l => l.invoice_status === 'paid');
  const overdueLoads = loads.filter(l => 
    l.invoice_status === 'sent' && 
    l.invoice_due_date && 
    new Date(l.invoice_due_date) < new Date()
  );

  const pendingRevenue = invoicedLoads
    .filter(l => l.invoice_status !== 'paid')
    .reduce((sum, l) => sum + (l.total_revenue || l.customer_rate || 0), 0);

  const handleExport = (format) => {
    alert(`Exporting accounting report as ${format.toUpperCase()}...`);
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Financial Summary
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleExport('csv')}
              className="h-8 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              CSV
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleExport('pdf')}
              className="h-8 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Revenue & Margin */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 mb-1">Net Margin</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-green-600">
                ${totalMargin.toLocaleString()}
              </p>
              <Badge className="bg-green-100 text-green-800 text-xs">
                {marginPercentage}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Billing Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Paid Invoices</span>
            </div>
            <Badge className="bg-blue-600 text-white">{paidLoads.length}</Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-amber-50 rounded border border-amber-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">Pending Revenue</span>
            </div>
            <Badge className="bg-amber-600 text-white">
              ${pendingRevenue.toLocaleString()}
            </Badge>
          </div>

          {overdueLoads.length > 0 && (
            <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Overdue Invoices</span>
              </div>
              <Badge className="bg-red-600 text-white">{overdueLoads.length}</Badge>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
          <Button size="sm" variant="outline" className="text-xs">
            View Invoices
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            Generate Report
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}