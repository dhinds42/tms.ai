import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Zap, Plus, Clock, CheckCircle, AlertTriangle } from "lucide-react";

import WorkflowBuilder from "../components/workflow/WorkflowBuilder";
import TriggerList from "../components/workflow/TriggerList";
import NotificationCenter from "../components/workflow/NotificationCenter";

export default function WorkflowAutomation() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState("triggers");
  const queryClient = useQueryClient();

  const { data: triggers } = useQuery({
    queryKey: ['workflowTriggers'],
    queryFn: () => base44.entities.WorkflowTrigger.list('-created_date', 100),
    initialData: [],
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 50),
    initialData: [],
  });

  const activeTriggers = triggers.filter(t => t.enabled);
  const pendingNotifications = notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              Workflow Automation
            </h1>
            <p className="text-slate-600 mt-2">Automated triggers, notifications, and business rules</p>
          </div>
          <Button onClick={() => setShowBuilder(!showBuilder)} className="bg-gradient-to-r from-purple-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active Triggers</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{activeTriggers.length}</p>
                </div>
                <Zap className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Executions Today</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {triggers.reduce((sum, t) => sum + (t.execution_count || 0), 0)}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending Notifications</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingNotifications.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Success Rate</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">98.5%</p>
                </div>
                <CheckCircle className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {showBuilder && (
          <WorkflowBuilder onClose={() => setShowBuilder(false)} />
        )}

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="triggers">Workflow Triggers</TabsTrigger>
                <TabsTrigger value="notifications">Notification Center</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>

              <TabsContent value="triggers">
                <TriggerList triggers={triggers} />
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationCenter notifications={notifications} />
              </TabsContent>

              <TabsContent value="templates">
                <div className="text-center py-12">
                  <p className="text-slate-600">Email and SMS templates coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}