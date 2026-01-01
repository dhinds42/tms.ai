import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

export default function AccessorialRequestList({ requests }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No accessorial requests</p>
      </div>
    );
  }

  const formatCents = (cents) => {
    return cents ? `$${(cents / 100).toFixed(2)}` : 'N/A';
  };

  const getApprovalBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'denied':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      case 'needs_info':
        return <Badge className="bg-blue-500"><AlertCircle className="w-3 h-3 mr-1" />Needs Info</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getEligibilityBadge = (status) => {
    switch (status) {
      case 'eligible':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Eligible</Badge>;
      case 'ineligible':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Ineligible</Badge>;
      case 'partially_eligible':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">Partial</Badge>;
      default:
        return <Badge variant="outline">Review</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <Card key={request.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 capitalize">
                    {request.accessorial_type.replace(/_/g, ' ')}
                  </h3>
                  {getApprovalBadge(request.approval_status)}
                </div>
                <p className="text-sm text-slate-600 mb-2">{request.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded p-3">
              <div>
                <p className="text-xs text-slate-500">Claimed</p>
                <p className="font-semibold text-slate-900">{formatCents(request.claimed_amount_cents)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Eligible</p>
                <p className="font-semibold text-indigo-600">{formatCents(request.computed_eligible_amount_cents)}</p>
              </div>
            </div>

            {request.approved_amount_cents && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
                <p className="text-xs text-slate-600">Approved Amount</p>
                <p className="text-lg font-bold text-green-700">{formatCents(request.approved_amount_cents)}</p>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              {getEligibilityBadge(request.eligibility_status)}
              {request.eligibility_reason && (
                <p className="text-xs text-slate-500">{request.eligibility_reason}</p>
              )}
            </div>

            {request.denial_reason && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800">
                <strong>Denial Reason:</strong> {request.denial_reason}
              </div>
            )}

            {request.evidence_attachments?.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-1">Evidence: {request.evidence_attachments.length} file(s)</p>
              </div>
            )}

            <p className="text-xs text-slate-400 mt-2">
              Submitted {new Date(request.created_date).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}