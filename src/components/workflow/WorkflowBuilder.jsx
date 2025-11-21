import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Play, CheckCircle, ArrowRight } from "lucide-react";

export default function WorkflowBuilder() {
  const [workflows] = useState([
    { 
      id: 1, 
      name: 'Auto-Tender to Top Carriers', 
      trigger: 'New Load Created',
      actions: ['Find carriers', 'Send tenders', 'Wait 30min', 'Escalate'],
      status: 'active',
      runs: 145
    },
    { 
      id: 2, 
      name: 'POD Auto-Processing', 
      trigger: 'POD Uploaded',
      actions: ['Extract data', 'Verify', 'Create invoice', 'Send to AP'],
      status: 'active',
      runs: 89
    },
    { 
      id: 3, 
      name: 'Late Delivery Alert', 
      trigger: 'ETA > Appointment Time',
      actions: ['Alert dispatcher', 'Notify customer', 'Log exception'],
      status: 'active',
      runs: 23
    }
  ]);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Workflow Automation Builder
          </CardTitle>
          <Button className="bg-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {workflows.map(workflow => (
          <div key={workflow.id} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-900">{workflow.name}</h4>
                  <Badge className={workflow.status === 'active' ? 'bg-emerald-600' : 'bg-slate-600'}>
                    {workflow.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  <strong>Trigger:</strong> {workflow.trigger}
                </p>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {workflow.actions.map((action, idx) => (
                    <React.Fragment key={idx}>
                      <Badge variant="outline" className="bg-white">
                        {action}
                      </Badge>
                      {idx < workflow.actions.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <div className="text-right mr-3">
                  <p className="text-xs text-slate-600">Executions</p>
                  <p className="text-2xl font-bold text-purple-600">{workflow.runs}</p>
                </div>
                <Button size="sm" variant="outline">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-emerald-900">Automation Impact</h4>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <p className="text-xs text-slate-600">Time Saved</p>
              <p className="text-2xl font-bold text-emerald-600">24hrs</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Tasks Automated</p>
              <p className="text-2xl font-bold text-indigo-600">257</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Error Reduction</p>
              <p className="text-2xl font-bold text-purple-600">-89%</p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}