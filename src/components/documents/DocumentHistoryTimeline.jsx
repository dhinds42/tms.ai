import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, FileText } from "lucide-react";
import { getActionBadgeColor } from "@/utils/documentFormatHandler";

export default function DocumentHistoryTimeline({ history }) {
  if (!history || history.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Document History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No history available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="w-5 h-5" />
          Document History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((entry, index) => (
            <div
              key={entry.id || index}
              className="flex items-start gap-3 p-3 border-l-2 border-indigo-200 hover:bg-slate-50 rounded-r-lg transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className={getActionBadgeColor(entry.action_type)}>
                    {entry.action_type?.toUpperCase()}
                  </Badge>
                  
                  {entry.file_format && (
                    <Badge className="bg-slate-100 text-slate-700 text-xs">
                      {entry.file_format.toUpperCase()}
                    </Badge>
                  )}
                  
                  {entry.user_role && (
                    <Badge className={
                      entry.user_role === 'broker' ? 'bg-indigo-100 text-indigo-800' :
                      entry.user_role === 'carrier' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    } style={{ fontSize: '10px' }}>
                      {entry.user_role.toUpperCase()}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">
                    {entry.action_by}
                  </p>
                  
                  <p className="text-xs text-slate-500">
                    {new Date(entry.timestamp || entry.created_date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>

                  {entry.module && entry.feature && (
                    <p className="text-xs text-slate-600">
                      {entry.module} → {entry.feature}
                    </p>
                  )}

                  {entry.notes && (
                    <p className="text-xs text-slate-700 mt-1 italic">
                      "{entry.notes}"
                    </p>
                  )}

                  {entry.file_size && (
                    <p className="text-xs text-slate-500">
                      Size: {(entry.file_size / 1024).toFixed(2)} KB
                    </p>
                  )}

                  {/* Show changes for edited actions */}
                  {entry.action_type === 'edited' && entry.previous_value && entry.new_value && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                      <p className="text-xs font-semibold text-amber-900 mb-1">Changes:</p>
                      <div className="text-xs text-amber-800 space-y-1">
                        {Object.keys(entry.new_value).map(key => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span>{' '}
                            <span className="line-through text-red-600">
                              {JSON.stringify(entry.previous_value[key])}
                            </span>
                            {' → '}
                            <span className="text-green-600">
                              {JSON.stringify(entry.new_value[key])}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        {history.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{history.length} total actions</span>
              <span>
                First: {new Date(history[history.length - 1]?.timestamp || history[history.length - 1]?.created_date).toLocaleDateString()}
              </span>
              <span>
                Latest: {new Date(history[0]?.timestamp || history[0]?.created_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}