import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";

export default function VarianceAlertWidget({ alert, onAcknowledge, onDispute }) {
  const [notes, setNotes] = React.useState('');
  const [showDispute, setShowDispute] = React.useState(false);

  if (!alert) return null;

  const formatCents = (cents) => {
    return `$${Math.abs(cents / 100).toFixed(2)}`;
  };

  const isNegative = alert.variance_cents < 0;
  const absVariance = Math.abs(alert.variance_cents);

  return (
    <Card className="border-2 border-amber-300 shadow-lg">
      <CardHeader className="bg-amber-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-5 h-5" />
            Pay Variance Alert
          </CardTitle>
          <Badge className={alert.status === 'open' ? 'bg-amber-500' : 'bg-slate-500'}>
            {alert.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Variance Display */}
        <div className={`rounded-lg p-4 ${isNegative ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {isNegative ? (
              <TrendingDown className="w-6 h-6 text-red-600" />
            ) : (
              <TrendingUp className="w-6 h-6 text-green-600" />
            )}
            <span className={`text-2xl font-bold ${isNegative ? 'text-red-700' : 'text-green-700'}`}>
              {isNegative ? '-' : '+'}{formatCents(absVariance)}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            {isNegative ? 'You received less than estimated' : 'You received more than estimated'}
          </p>
        </div>

        {/* Pay Breakdown */}
        <div className="space-y-2 bg-slate-50 rounded p-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Estimated Pay:</span>
            <span className="font-semibold">{formatCents(alert.estimated_pay_cents)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Final Pay:</span>
            <span className="font-semibold">{formatCents(alert.final_pay_cents)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-bold text-slate-900">Variance:</span>
            <span className={`font-bold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
              {isNegative ? '-' : '+'}{formatCents(absVariance)} ({alert.variance_percent}%)
            </span>
          </div>
        </div>

        {/* Reason */}
        {alert.reason_details && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs font-semibold text-blue-900 mb-1">Reason</p>
            <p className="text-sm text-slate-700">{alert.reason_details}</p>
          </div>
        )}

        {/* Actions */}
        {alert.status === 'open' && (
          <div className="space-y-3">
            {!showDispute ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => onAcknowledge(alert.id)}
                  variant="outline"
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Acknowledge
                </Button>
                <Button
                  onClick={() => setShowDispute(true)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Dispute Variance
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain why you believe the variance is incorrect..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowDispute(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      onDispute(alert.id, notes);
                      setShowDispute(false);
                    }}
                    disabled={!notes.trim()}
                    className="flex-1 bg-amber-600"
                  >
                    Submit Dispute
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {alert.driver_notes && (
          <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm">
            <strong className="text-purple-900">Your Notes:</strong>{' '}
            <span className="text-slate-700">{alert.driver_notes}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}