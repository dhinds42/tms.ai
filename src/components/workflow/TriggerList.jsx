import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Play, Pause } from "lucide-react";

export default function TriggerList({ triggers }) {
  return (
    <div className="space-y-3">
      {triggers.map(trigger => (
        <Card key={trigger.id} className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-900">{trigger.trigger_name}</span>
                  <Badge className={trigger.enabled ? 'bg-emerald-600' : 'bg-slate-400'}>
                    {trigger.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Trigger Type</p>
                    <p className="font-semibold">{trigger.trigger_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Entity</p>
                    <p className="font-semibold">{trigger.entity_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Executions</p>
                    <p className="font-semibold">{trigger.execution_count || 0}</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {trigger.actions?.map((action, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {action.action_type}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  {trigger.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {triggers.length === 0 && (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No workflow triggers yet</p>
        </div>
      )}
    </div>
  );
}