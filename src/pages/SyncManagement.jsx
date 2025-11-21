import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertTriangle, Clock, ArrowRight } from "lucide-react";

export default function SyncManagement() {
  const queryClient = useQueryClient();

  const { data: syncLogs } = useQuery({
    queryKey: ['syncLogs'],
    queryFn: () => base44.entities.SyncLog.list('-sync_started_at', 100),
    initialData: [],
  });

  const pendingSync = syncLogs.filter(s => s.sync_status === 'pending');
  const completedSync = syncLogs.filter(s => s.sync_status === 'completed');
  const failedSync = syncLogs.filter(s => s.sync_status === 'failed');

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      failed: 'bg-red-100 text-red-800',
      partial: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              TMS-A ↔ TMS-B Sync Management
            </h1>
            <p className="text-slate-600 mt-2">Bidirectional data synchronization monitoring</p>
          </div>
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Force Sync All
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingSync.length}</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Completed</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{completedSync.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Failed</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{failedSync.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Success Rate</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {((completedSync.length / syncLogs.length) * 100 || 0).toFixed(1)}%
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Sync Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {syncLogs.map(log => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-slate-900">{log.entity_type}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <Badge className={getStatusColor(log.sync_status)}>{log.sync_status}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">Entity ID</p>
                          <p className="font-semibold">{log.entity_id?.slice(0, 8)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Direction</p>
                          <p className="font-semibold">{log.sync_direction}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Started</p>
                          <p className="font-semibold">{log.sync_started_at && new Date(log.sync_started_at).toLocaleTimeString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Fields</p>
                          <p className="font-semibold">{log.fields_synced?.length || 0}</p>
                        </div>
                      </div>
                      {log.error_message && (
                        <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                          Error: {log.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {syncLogs.length === 0 && (
                <div className="text-center py-12">
                  <RefreshCw className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No sync activity yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}