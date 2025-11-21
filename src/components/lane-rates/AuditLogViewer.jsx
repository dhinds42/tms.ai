import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Shield } from "lucide-react";

export default function AuditLogViewer({ history }) {
  const getActionColor = (action) => {
    const colors = {
      created: 'bg-blue-100 text-blue-800',
      updated: 'bg-indigo-100 text-indigo-800',
      rate_changed: 'bg-purple-100 text-purple-800',
      status_changed: 'bg-cyan-100 text-cyan-800',
      flagged: 'bg-orange-100 text-orange-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      declined: 'bg-red-100 text-red-800',
      approved: 'bg-green-100 text-green-800',
      synced: 'bg-teal-100 text-teal-800',
      rolled_back: 'bg-amber-100 text-amber-800'
    };
    return colors[action] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-3">
      {history.map((log, idx) => (
        <Card key={idx} className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                  <span className="text-sm text-slate-600">Lane Rate: {log.lane_rate_id?.slice(0, 8)}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-xs text-slate-600 mt-2">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{log.changed_by_user_id?.slice(0, 8)} ({log.changed_by_role})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>System: {log.system_source}</span>
                  </div>
                </div>

                {log.reason && (
                  <p className="text-sm text-slate-700 mt-2 bg-slate-100 p-2 rounded">
                    Reason: {log.reason}
                  </p>
                )}

                {log.field_changed && (
                  <p className="text-xs text-slate-500 mt-1">
                    Field changed: <span className="font-semibold">{log.field_changed}</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {history.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No audit logs yet</p>
        </div>
      )}
    </div>
  );
}