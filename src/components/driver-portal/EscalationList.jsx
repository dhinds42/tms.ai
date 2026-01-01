import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function EscalationList({ escalations }) {
  if (!escalations || escalations.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No issues reported</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-amber-500">Open</Badge>;
      case 'triaged':
        return <Badge className="bg-blue-500">In Review</Badge>;
      case 'in_progress':
        return <Badge className="bg-indigo-500">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-slate-500">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'urgent':
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {escalations.map((escalation) => (
        <Card key={escalation.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getSeverityIcon(escalation.severity)}
                  <h3 className="font-semibold text-slate-900">{escalation.title}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-2">{escalation.notes}</p>
                <div className="flex gap-2 text-xs text-slate-500">
                  <span>{new Date(escalation.created_at).toLocaleString()}</span>
                  {escalation.escalation_type && (
                    <span>• {escalation.escalation_type.replace(/_/g, ' ')}</span>
                  )}
                </div>
                {escalation.resolution_notes && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <strong className="text-green-800">Resolution:</strong>{' '}
                    <span className="text-slate-700">{escalation.resolution_notes}</span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                {getStatusBadge(escalation.status)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}