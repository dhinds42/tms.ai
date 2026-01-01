import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, CheckCircle, Clock } from "lucide-react";

export default function PayConfidenceWidget({ payConfidence }) {
  if (!payConfidence) return null;

  const formatCents = (cents) => {
    return cents ? `$${(cents / 100).toFixed(2)}` : 'N/A';
  };

  const getStateInfo = (state) => {
    switch (state) {
      case 'estimated':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-blue-500',
          text: 'Estimated',
          description: 'Initial offer amount'
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-amber-500',
          text: 'Pending Review',
          description: 'Under carrier review'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-emerald-500',
          text: 'Approved',
          description: 'Approved for payment'
        };
      case 'final':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-purple-600',
          text: 'Final',
          description: 'Payment finalized'
        };
      default:
        return {
          icon: <DollarSign className="w-4 h-4" />,
          color: 'bg-slate-500',
          text: state,
          description: ''
        };
    }
  };

  const stateInfo = getStateInfo(payConfidence.pay_confidence_state);
  const currentPayAmount = 
    payConfidence.final_pay_cents ||
    payConfidence.approved_pay_cents ||
    payConfidence.pending_pay_cents ||
    payConfidence.estimated_pay_cents;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Pay Confidence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <Badge className={`${stateInfo.color} text-white flex items-center gap-1`}>
            {stateInfo.icon}
            {stateInfo.text}
          </Badge>
          <span className="text-2xl font-bold text-slate-900">
            {formatCents(currentPayAmount)}
          </span>
        </div>

        <p className="text-sm text-slate-600">{stateInfo.description}</p>

        {/* Pay Breakdown */}
        <div className="space-y-2 bg-slate-50 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Estimated:</span>
            <span className="font-semibold">{formatCents(payConfidence.estimated_pay_cents)}</span>
          </div>
          {payConfidence.pending_pay_cents && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Pending:</span>
              <span className="font-semibold">{formatCents(payConfidence.pending_pay_cents)}</span>
            </div>
          )}
          {payConfidence.approved_pay_cents && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Approved:</span>
              <span className="font-semibold text-emerald-600">{formatCents(payConfidence.approved_pay_cents)}</span>
            </div>
          )}
          {payConfidence.final_pay_cents && (
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-900">Final:</span>
              <span className="text-purple-600">{formatCents(payConfidence.final_pay_cents)}</span>
            </div>
          )}
        </div>

        {/* Variance (if applicable) */}
        {payConfidence.variance_cents !== undefined && payConfidence.variance_cents !== 0 && (
          <div className={`text-sm p-2 rounded ${payConfidence.variance_cents > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            Variance: {payConfidence.variance_cents > 0 ? '+' : ''}{formatCents(Math.abs(payConfidence.variance_cents))}
          </div>
        )}

        {/* Last Updated */}
        {payConfidence.updated_at && (
          <p className="text-xs text-slate-500">
            Updated: {new Date(payConfidence.updated_at).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}