import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Zap, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

export default function AutomatedSyncEngine() {
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState(null);
  const queryClient = useQueryClient();

  const { data: syncLogs = [] } = useScopedEntity('SyncLog', { limit: 20 });

  const triggerSyncMutation = useMutation({
    mutationFn: async (entityType) => {
      setSyncing(true);
      setSyncResults(null);
      
      const results = {
        entity_type: entityType,
        synced: 0,
        failed: 0,
        total: 0,
        errors: []
      };

      try {
        // Fetch entities that need sync
        let entities = [];
        switch (entityType) {
          case 'Load':
            entities = await base44.entities.Load.filter({ synced_to_tms_b: false }, '-created_date', 100);
            break;
          case 'Driver':
            entities = await base44.entities.Driver.filter({ synced_to_tms_b: false }, '-created_date', 100);
            break;
          case 'Document':
            entities = await base44.entities.Document.filter({ synced_to_tms_b: false }, '-created_date', 100);
            break;
          case 'ComplianceItem':
            entities = await base44.entities.ComplianceItem.filter({ synced_to_tms_b: false }, '-created_date', 100);
            break;
        }

        results.total = entities.length;

        // Sync each entity
        for (const entity of entities) {
          try {
            await base44.entities[entityType].update(entity.id, {
              synced_to_tms_b: true,
              last_sync_at: new Date().toISOString(),
              tms_environment: 'both'
            });

            // Log sync
            await base44.entities.SyncLog.create({
              entity_type: entityType,
              entity_id: entity.id,
              sync_direction: 'tms_a_to_b',
              sync_status: 'completed',
              sync_started_at: new Date().toISOString(),
              sync_completed_at: new Date().toISOString(),
              source_system: 'tms_a',
              target_system: 'tms_b'
            });

            results.synced++;
          } catch (err) {
            results.failed++;
            results.errors.push({ entity_id: entity.id, error: err.message });
          }
        }

        return results;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (results) => {
      setSyncResults(results);
      queryClient.invalidateQueries(['recentSyncLogs']);
      queryClient.invalidateQueries(['loads']);
      queryClient.invalidateQueries(['drivers']);
      queryClient.invalidateQueries(['documents']);
      queryClient.invalidateQueries(['complianceItems']);
    },
    onSettled: () => {
      setSyncing(false);
    },
  });

  const syncAll = async () => {
    const entities = ['Load', 'Driver', 'Document', 'ComplianceItem'];
    for (const entity of entities) {
      await triggerSyncMutation.mutateAsync(entity);
    }
  };

  const recentSuccessful = syncLogs.filter(log => log.sync_status === 'completed').length;
  const recentFailed = syncLogs.filter(log => log.sync_status === 'failed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Automated Sync Engine
          </h1>
          <p className="text-slate-600 mt-2">Manual sync triggers for TMS-A → TMS-B data synchronization</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Recent Syncs</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{syncLogs.length}</p>
                </div>
                <RefreshCw className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Successful</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{recentSuccessful}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Failed</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{recentFailed}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Success Rate</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {syncLogs.length > 0 ? Math.round((recentSuccessful / syncLogs.length) * 100) : 0}%
                  </p>
                </div>
                <Zap className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Sync Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => triggerSyncMutation.mutate('Load')}
                disabled={syncing}
                className="h-24 bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                <div className="flex flex-col items-center">
                  <RefreshCw className={`w-6 h-6 mb-2 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Sync Loads</span>
                </div>
              </Button>

              <Button
                onClick={() => triggerSyncMutation.mutate('Driver')}
                disabled={syncing}
                className="h-24 bg-gradient-to-r from-emerald-600 to-teal-600"
              >
                <div className="flex flex-col items-center">
                  <RefreshCw className={`w-6 h-6 mb-2 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Sync Drivers</span>
                </div>
              </Button>

              <Button
                onClick={() => triggerSyncMutation.mutate('Document')}
                disabled={syncing}
                className="h-24 bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                <div className="flex flex-col items-center">
                  <RefreshCw className={`w-6 h-6 mb-2 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Sync Documents</span>
                </div>
              </Button>

              <Button
                onClick={() => triggerSyncMutation.mutate('ComplianceItem')}
                disabled={syncing}
                className="h-24 bg-gradient-to-r from-amber-600 to-orange-600"
              >
                <div className="flex flex-col items-center">
                  <RefreshCw className={`w-6 h-6 mb-2 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Sync Compliance</span>
                </div>
              </Button>
            </div>

            <Button
              onClick={syncAll}
              disabled={syncing}
              className="w-full mt-4 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-lg"
            >
              <Zap className={`w-5 h-5 mr-2 ${syncing ? 'animate-pulse' : ''}`} />
              Sync All Entities
            </Button>
          </CardContent>
        </Card>

        {syncResults && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                Sync Complete: {syncResults.entity_type}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-600">Total Entities</p>
                  <p className="text-2xl font-bold text-slate-900">{syncResults.total}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Synced Successfully</p>
                  <p className="text-2xl font-bold text-emerald-600">{syncResults.synced}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{syncResults.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Recent Sync Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {syncLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {log.sync_status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{log.entity_type}</p>
                      <p className="text-xs text-slate-600">
                        {new Date(log.sync_completed_at || log.created_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{log.source_system}</Badge>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <Badge variant="outline">{log.target_system}</Badge>
                    <Badge className={log.sync_status === 'completed' ? 'bg-emerald-600' : 'bg-red-600'}>
                      {log.sync_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}