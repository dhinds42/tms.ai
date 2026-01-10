import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, DollarSign } from "lucide-react";

export default function SettlementCard({ settlement, recipient, onApprove, onPay }) {
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-100 text-amber-800',
      'approved': 'bg-blue-100 text-blue-800',
      'paid': 'bg-emerald-100 text-emerald-800',
      'disputed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{settlement.settlement_number || settlement.id.slice(0, 8)}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              {recipient ? `${recipient.first_name || recipient.company_name} ${recipient.last_name || ''}` : 'Unknown'}
            </p>
          </div>
          <Badge className={getStatusColor(settlement.status)}>{settlement.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Period</span>
            <span className="font-semibold text-slate-900">
              {new Date(settlement.period_start).toLocaleDateString()} - {new Date(settlement.period_end).toLocaleDateString()}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
            <span className="text-sm text-slate-600">Total Amount</span>
            <span className="text-2xl font-bold text-emerald-600">${settlement.total_amount?.toLocaleString() || 0}</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Gross Pay</span>
              <span className="font-semibold">${settlement.gross_amount?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Deductions</span>
              <span className="font-semibold text-red-600">-${settlement.deductions_amount?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Advances</span>
              <span className="font-semibold text-red-600">-${settlement.advances_amount?.toLocaleString() || 0}</span>
            </div>
          </div>

          {settlement.status === 'pending' && (
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => onApprove(settlement.id)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button variant="outline" className="flex-1">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Dispute
              </Button>
            </div>
          )}

          {settlement.status === 'approved' && (
            <Button
              onClick={() => onPay(settlement.id)}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Mark as Paid
            </Button>
          )}

          {settlement.status === 'paid' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
              <p className="text-sm font-semibold text-emerald-800">
                ✓ Paid on {new Date(settlement.paid_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}