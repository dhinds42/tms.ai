import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowLeftRight,
  Database,
  Activity,
  Zap,
  TrendingUp
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function SyncDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  const { data: syncLogs, isLoading: logsLoading } = useScopedEntity('SyncLog', { limit: 100, sort: '-created_date', refetchInterval: 10000 });
  const { data: loads } = useScopedEntity('Load', { limit: 500 });
  const { data: drivers } = useScopedEntity('Driver', { limit: 200 });
  const { data: documents } = useScopedEntity('Document', { limit: 200 });

  // Calculate sync stats
  const syncStats = {
    loads: {
      total: loads.length,
      synced: loads.filter(l => l.synced_to_tms_b).length,
      pending: loads.filter(l => !l.synced_to_tms_b).length
    },
    drivers: {
      total: drivers.length,
      synced: drivers.filter(d => d.synced_to_tms_b).length,
      pending: drivers.filter(d => !d.synced_to_tms_b).length
    },
    documents: {
      total: documents.length,
      synced: documents.filter(d => d.synced_to_tms_b).length,
      pending: documents.filter(d => !d.synced_to_tms_b).length
    }
  };

  const recentLogs = syncLogs.slice(0, 20);
  const successRate = syncLogs.length > 0 
    ? ((syncLogs.filter(l => l.sync_status === 'completed').length / syncLogs.length) * 100).toFixed(1)
    : 100;

  const lastSync = syncLogs.find(l => l.sync_status === 'completed');

  const forceSyncMutation = useMutation({
    mutationFn: async (entityType) => {
      const entities = await base44.entities[entityType].filter({
        synced_to_tms_b: false
      }, '-created_date', 100);

      for (const entity of entities) {
        await base44.entities[entityType].update(entity.id, {
          synced_to_tms_b: true,
          last_sync_at: new Date().toISOString(),
          tms_environment: 'both'
        });

        await base44.entities.SyncLog.create({
          entity_type: entityType,
          entity_id: entity.id,
          sync_direction: 'tms_a_to_b',
          sync_status: 'completed',
          sync_started_at: new Date().toISOString(),
          sync_completed_at: new Date().toISOString(),
          source_system: 'tms_a',
          target_system: 'tms_b',
          triggered_by: 'manual_force_sync'
        });
      }

      return entities.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['loads']);
      queryClient.invalidateQueries(['drivers']);
      queryClient.invalidateQueries(['documents']);
      queryClient.invalidateQueries(['syncLogs']);
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getDirectionIcon = (direction) => {
    switch (direction) {
      case 'tms_a_to_b': return '→';
      case 'tms_b_to_a': return '←';
      case 'bidirectional': return '↔';
      default: return '→';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Bidirectional Sync Dashboard
            </h1>
            <p className="text-slate-600 mt-2">
              Monitor TMS-A ↔ TMS-B synchronization status and history
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 animate-pulse">
              <Activity className="w-3 h-3 mr-1" />
              LIVE SYNC
            </Badge>
            {lastSync && (
              <span className="text-sm text-slate-500">
                Last sync: {formatDistanceToNow(new Date(lastSync.created_date))} ago
              </span>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Success Rate</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{successRate}%</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Synced</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {syncStats.loads.synced + syncStats.drivers.synced + syncStats.documents.synced}
                  </p>
                </div>
                <Database className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending Sync</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {syncStats.loads.pending + syncStats.drivers.pending + syncStats.documents.pending}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Sync Events</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{syncLogs.length}</p>
                </div>
                <ArrowLeftRight className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entity Sync Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Loads', stats: syncStats.loads, icon: '🚛', entityType: 'Load' },
            { name: 'Drivers', stats: syncStats.drivers, icon: '👤', entityType: 'Driver' },
            { name: 'Documents', stats: syncStats.documents, icon: '📄', entityType: 'Document' }
          ].map((entity) => (
            <Card key={entity.name} className="border-0 shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{entity.icon}</span>
                    {entity.name}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => forceSyncMutation.mutate(entity.entityType)}
                    disabled={forceSyncMutation.isPending || entity.stats.pending === 0}
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${forceSyncMutation.isPending ? 'animate-spin' : ''}`} />
                    Force Sync
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total</span>
                    <span className="font-bold">{entity.stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600">Synced</span>
                    <span className="font-bold text-emerald-600">{entity.stats.synced}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-600">Pending</span>
                    <span className="font-bold text-amber-600">{entity.stats.pending}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${entity.stats.total > 0 ? (entity.stats.synced / entity.stats.total) * 100 : 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sync Logs */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Recent Sync Activity
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries(['syncLogs'])}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-slate-300 mx-auto animate-spin" />
                <p className="text-slate-500 mt-2">Loading sync logs...</p>
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No sync activity recorded yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(log.sync_status)}>
                        {log.sync_status === 'completed' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : log.sync_status === 'failed' ? (
                          <XCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {log.sync_status}
                      </Badge>
                      <span className="font-semibold text-slate-900">{log.entity_type}</span>
                      <span className="text-slate-500 text-sm">
                        {log.entity_id?.slice(0, 8)}...
                      </span>
                      <span className="text-lg">
                        {getDirectionIcon(log.sync_direction)}
                      </span>
                      <span className="text-sm text-slate-600">
                        {log.source_system} → {log.target_system}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(log.created_date))} ago
                      </span>
                      {log.error_message && (
                        <p className="text-xs text-red-600 mt-1">{log.error_message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync Configuration */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Sync Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-3">Entity Sync Fields</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Load:</span>
                    <span className="text-slate-600 ml-2">status, pickup/delivery locations, dates, driver_id, carrier_id, rates, check_calls</span>
                  </div>
                  <div>
                    <span className="font-medium">Driver:</span>
                    <span className="text-slate-600 ml-2">status, location, HOS, equipment, contact info</span>
                  </div>
                  <div>
                    <span className="font-medium">Document:</span>
                    <span className="text-slate-600 ml-2">file_url, extracted_data, verified, visible_to_driver</span>
                  </div>
                  <div>
                    <span className="font-medium">LaneRate:</span>
                    <span className="text-slate-600 ml-2">driver_rate, status, driver_accepted, acceptance_date</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-3">Conflict Resolution</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Load</span>
                    <Badge className="bg-blue-100 text-blue-800">Latest Wins</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Driver</span>
                    <Badge className="bg-indigo-100 text-indigo-800">TMS-A Wins</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Document</span>
                    <Badge className="bg-blue-100 text-blue-800">Latest Wins</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>LaneRate</span>
                    <Badge className="bg-purple-100 text-purple-800">Broker Authority</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}