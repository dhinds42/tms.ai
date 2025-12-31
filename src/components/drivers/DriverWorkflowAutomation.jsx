import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle, Clock } from "lucide-react";

export default function DriverWorkflowAutomation({ driver }) {
  const workflows = [
    { 
      name: 'Pre-Trip Inspection', 
      status: 'completed', 
      completed_at: new Date(Date.now() - 3600000),
      auto_triggered: true 
    },
    { 
      name: 'Load Assignment Notification', 
      status: 'completed', 
      completed_at: new Date(Date.now() - 7200000),
      auto_triggered: true 
    },
    { 
      name: 'ELD Sync', 
      status: 'in_progress', 
      auto_triggered: true 
    },
    { 
      name: 'Post-Delivery Survey', 
      status: 'pending', 
      auto_triggered: true 
    }
  ];
  
  return (
    <Card className="border-cyan-200 bg-cyan-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-600" />
          Automated Workflows
          <Badge className="ml-auto bg-cyan-600 text-xs">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {workflows.map((workflow, idx) => (
          <div key={idx} className="p-3 bg-white rounded-lg border border-cyan-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold">{workflow.name}</p>
              {workflow.completed_at && (
                <p className="text-xs text-slate-500">
                  {new Date(workflow.completed_at).toLocaleTimeString()}
                </p>
              )}
            </div>
            {workflow.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
            {workflow.status === 'in_progress' && <Clock className="w-4 h-4 text-blue-600 animate-pulse" />}
            {workflow.status === 'pending' && <Badge variant="outline">Pending</Badge>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}