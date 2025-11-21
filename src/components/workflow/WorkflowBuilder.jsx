import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Plus } from "lucide-react";

export default function WorkflowBuilder({ onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    trigger_name: '',
    trigger_type: 'entity_created',
    entity_type: 'Load',
    conditions: {},
    actions: [],
    enabled: true,
    priority: 5
  });

  const [newAction, setNewAction] = useState({
    action_type: 'send_notification',
    target: '',
    template: '',
    data: {}
  });

  const createTriggerMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkflowTrigger.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflowTriggers']);
      onClose();
    },
  });

  const handleAddAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, newAction]
    });
    setNewAction({
      action_type: 'send_notification',
      target: '',
      template: '',
      data: {}
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTriggerMutation.mutate(formData);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle>Create Workflow Trigger</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <Label>Trigger Name *</Label>
            <Input
              value={formData.trigger_name}
              onChange={(e) => setFormData({...formData, trigger_name: e.target.value})}
              placeholder="e.g., Auto-tender new loads"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trigger Type *</Label>
              <Select value={formData.trigger_type} onValueChange={(value) => setFormData({...formData, trigger_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entity_created">Entity Created</SelectItem>
                  <SelectItem value="entity_updated">Entity Updated</SelectItem>
                  <SelectItem value="status_changed">Status Changed</SelectItem>
                  <SelectItem value="field_changed">Field Changed</SelectItem>
                  <SelectItem value="date_reached">Date Reached</SelectItem>
                  <SelectItem value="threshold_exceeded">Threshold Exceeded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Entity Type *</Label>
              <Select value={formData.entity_type} onValueChange={(value) => setFormData({...formData, entity_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Load">Load</SelectItem>
                  <SelectItem value="Driver">Driver</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="ComplianceItem">Compliance Item</SelectItem>
                  <SelectItem value="LaneRate">Lane Rate</SelectItem>
                  <SelectItem value="Invoice">Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Actions</Label>
            <div className="space-y-3">
              {formData.actions.map((action, idx) => (
                <div key={idx} className="p-3 bg-slate-100 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{action.action_type}</p>
                    <p className="text-xs text-slate-600">Target: {action.target}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({
                      ...formData,
                      actions: formData.actions.filter((_, i) => i !== idx)
                    })}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg space-y-3">
                <Select value={newAction.action_type} onValueChange={(value) => setNewAction({...newAction, action_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="send_notification">Send Notification</SelectItem>
                    <SelectItem value="send_email">Send Email</SelectItem>
                    <SelectItem value="send_sms">Send SMS</SelectItem>
                    <SelectItem value="update_entity">Update Entity</SelectItem>
                    <SelectItem value="sync_to_tms_b">Sync to TMS-B</SelectItem>
                    <SelectItem value="auto_tender">Auto Tender</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Target (user ID, email, entity ID)"
                  value={newAction.target}
                  onChange={(e) => setNewAction({...newAction, target: e.target.value})}
                />
                <Button type="button" onClick={handleAddAction} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Action
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-purple-600">
              <Save className="w-4 h-4 mr-2" />
              Create Trigger
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}