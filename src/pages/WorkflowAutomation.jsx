import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Plus, Settings, Play, Pause, Trash2, CheckCircle, AlertTriangle } from "lucide-react";

export default function WorkflowAutomation() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workflows, setWorkflows] = useState([
    {
      id: '1',
      name: 'Auto-Invoice After Delivery',
      description: 'Automatically create invoice when load is delivered',
      trigger: { type: 'load_status_change', condition: 'status = delivered' },
      actions: [
        { type: 'create_invoice', config: { auto_send: true } },
        { type: 'send_email', config: { to: 'customer', template: 'invoice_ready' } }
      ],
      is_active: true,
      execution_count: 247
    },
    {
      id: '2',
      name: 'Document Verification Alert',
      description: 'Alert when uploaded documents need verification',
      trigger: { type: 'document_uploaded', condition: 'verified = false' },
      actions: [
        { type: 'send_notification', config: { users: ['dispatcher', 'ops_manager'] } },
        { type: 'create_task', config: { assigned_to: 'dispatcher', priority: 'high' } }
      ],
      is_active: true,
      execution_count: 89
    },
    {
      id: '3',
      name: 'Carrier Performance Tracking',
      description: 'Update carrier scores after each delivery',
      trigger: { type: 'load_status_change', condition: 'status = delivered' },
      actions: [
        { type: 'calculate_performance', config: { metrics: ['on_time', 'claims', 'communication'] } },
        { type: 'update_carrier_score', config: { auto_flag_issues: true } }
      ],
      is_active: true,
      execution_count: 198
    },
    {
      id: '4',
      name: 'Load Opportunity Alert',
      description: 'Notify when high-margin loads are created',
      trigger: { type: 'load_created', condition: 'margin_pct > 20' },
      actions: [
        { type: 'send_notification', config: { users: ['sales', 'dispatch'] } },
        { type: 'priority_flag', config: { color: 'green', label: 'high_value' } }
      ],
      is_active: false,
      execution_count: 34
    }
  ]);

  const CreateWorkflowModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      trigger_type: 'load_status_change',
      trigger_condition: '',
      actions: []
    });

    const triggerTypes = [
      { value: 'load_created', label: 'Load Created' },
      { value: 'load_status_change', label: 'Load Status Change' },
      { value: 'document_uploaded', label: 'Document Uploaded' },
      { value: 'invoice_created', label: 'Invoice Created' },
      { value: 'payment_received', label: 'Payment Received' },
      { value: 'schedule_time', label: 'Scheduled Time' }
    ];

    const actionTypes = [
      { value: 'create_invoice', label: '💵 Create Invoice' },
      { value: 'send_email', label: '📧 Send Email' },
      { value: 'send_notification', label: '🔔 Send Notification' },
      { value: 'create_task', label: '✓ Create Task' },
      { value: 'update_status', label: '🔄 Update Status' },
      { value: 'calculate_performance', label: '📊 Calculate Performance' },
      { value: 'call_webhook', label: '🔗 Call Webhook' }
    ];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Create Workflow Automation</h2>
            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label>Workflow Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Auto-create invoice after delivery"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of what this workflow does"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Trigger Configuration */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-4">⚡ Trigger (When should this run?)</h3>
              <div className="space-y-4">
                <Select value={formData.trigger_type} onValueChange={(v) => setFormData({...formData, trigger_type: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger event" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={formData.trigger_condition}
                  onChange={(e) => setFormData({...formData, trigger_condition: e.target.value})}
                  placeholder="Condition (e.g., status = delivered, margin_pct > 20)"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h3 className="font-semibold text-emerald-900 mb-4">🎯 Actions (What should happen?)</h3>
              <p className="text-sm text-emerald-800 mb-4">Select one or more actions to execute:</p>
              <div className="grid grid-cols-2 gap-2">
                {actionTypes.map(action => (
                  <Button key={action.value} variant="outline" size="sm" className="justify-start">
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <Zap className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
              <Button onClick={() => setShowCreateModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const toggleWorkflow = (id) => {
    setWorkflows(workflows.map(w => 
      w.id === id ? {...w, is_active: !w.is_active} : w
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Workflow Automation
            </h1>
            <p className="text-slate-600 mt-2">
              Automate repetitive tasks with intelligent triggers and actions
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Active Workflows</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    {workflows.filter(w => w.is_active).length}
                  </p>
                </div>
                <Zap className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Total Executions</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {workflows.reduce((sum, w) => sum + w.execution_count, 0)}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Today's Runs</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">47</p>
                </div>
                <Play className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Success Rate</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">98.5%</p>
                </div>
                <CheckCircle className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflows List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="border-0 shadow-xl bg-white">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{workflow.name}</CardTitle>
                      <Badge className={workflow.is_active ? 'bg-emerald-600' : 'bg-slate-400'}>
                        {workflow.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{workflow.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                
                {/* Trigger */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-1">⚡ TRIGGER</p>
                  <p className="text-sm text-blue-800">
                    {workflow.trigger.type.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="text-xs text-blue-700 mt-1 font-mono">{workflow.trigger.condition}</p>
                </div>

                {/* Actions */}
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-900 mb-2">🎯 ACTIONS ({workflow.actions.length})</p>
                  <div className="space-y-1">
                    {workflow.actions.map((action, idx) => (
                      <p key={idx} className="text-sm text-emerald-800">
                        {idx + 1}. {action.type.replace(/_/g, ' ').toUpperCase()}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Executed <strong className="text-slate-900">{workflow.execution_count}</strong> times
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleWorkflow(workflow.id)}
                      size="sm"
                      variant="outline"
                      className={workflow.is_active ? 'text-amber-600' : 'text-emerald-600'}
                    >
                      {workflow.is_active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>

        {showCreateModal && <CreateWorkflowModal />}

      </div>
    </div>
  );
}