import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileCheck, FileX, Clock, CheckCircle } from "lucide-react";

export default function DocumentChecklistWidget({ checklist }) {
  if (!checklist) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'invalid':
        return <FileX className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'invalid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const docTypeLabels = {
    bol: 'Bill of Lading',
    pod: 'Proof of Delivery',
    rate_confirmation: 'Rate Confirmation',
    lumper_receipt: 'Lumper Receipt',
    scale_ticket: 'Scale Ticket',
    customs: 'Customs Documents',
    inspection: 'Inspection Report'
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            Document Checklist
          </CardTitle>
          <Badge className={checklist.billing_ready ? 'bg-green-500' : 'bg-amber-500'}>
            {checklist.billing_ready ? 'Billing Ready' : 'Incomplete'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Completion</span>
            <span className="font-semibold text-slate-900">{checklist.billing_ready_percent}%</span>
          </div>
          <Progress value={checklist.billing_ready_percent} className="h-2" />
        </div>

        {/* Document List */}
        <div className="space-y-2">
          {checklist.required_docs?.map((docType) => {
            const status = checklist.doc_status_by_type?.[docType] || 'pending';
            return (
              <div key={docType} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className="text-sm font-medium text-slate-700">
                    {docTypeLabels[docType] || docType}
                  </span>
                </div>
                <Badge variant="outline" className={getStatusColor(status)}>
                  {status}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Notes */}
        {checklist.notes && (
          <div className="text-xs text-slate-600 p-2 bg-amber-50 border border-amber-200 rounded">
            <strong>Note:</strong> {checklist.notes}
          </div>
        )}

        {/* Last Updated */}
        {checklist.last_computed_at && (
          <p className="text-xs text-slate-500">
            Last updated: {new Date(checklist.last_computed_at).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}