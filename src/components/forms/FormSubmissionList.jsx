import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";

export default function FormSubmissionList({ submissions }) {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-slate-400',
      submitted: 'bg-blue-600',
      approved: 'bg-emerald-600',
      rejected: 'bg-red-600',
      archived: 'bg-gray-600'
    };
    return colors[status] || 'bg-slate-400';
  };

  return (
    <div className="space-y-3">
      {submissions.map(submission => (
        <Card key={submission.id} className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-900">{submission.submission_id}</span>
                  <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Party Type</p>
                    <p className="font-semibold capitalize">{submission.party_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Submitted</p>
                    <p className="font-semibold">{new Date(submission.created_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">CRM Sync</p>
                    <Badge variant="outline" className={submission.synced_to_crm ? 'bg-emerald-50' : 'bg-slate-50'}>
                      {submission.synced_to_crm ? 'Synced' : 'Pending'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">TMS Sync</p>
                    <Badge variant="outline" className={submission.synced_to_tms ? 'bg-emerald-50' : 'bg-slate-50'}>
                      {submission.synced_to_tms ? 'Synced' : 'Pending'}
                    </Badge>
                  </div>
                </div>
                {submission.signatures && submission.signatures.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {submission.signatures.map((sig, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        ✓ {sig.signer_role}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                {submission.pdf_generated_url && (
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {submissions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No form submissions yet</p>
        </div>
      )}
    </div>
  );
}