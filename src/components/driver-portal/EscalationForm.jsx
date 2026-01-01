import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

export default function EscalationForm({ loadId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    escalation_type: 'other',
    severity: 'medium',
    title: '',
    notes: '',
    attachments: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, load_id: loadId });
  };

  return (
    <Card className="shadow-lg border-2 border-amber-200">
      <CardHeader className="bg-amber-50">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <AlertTriangle className="w-5 h-5" />
          Report an Issue
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Issue Type *</Label>
            <Select
              value={formData.escalation_type}
              onValueChange={(value) => setFormData({ ...formData, escalation_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="late_appointment">Late Appointment</SelectItem>
                <SelectItem value="refused_load">Refused Load</SelectItem>
                <SelectItem value="breakdown">Vehicle Breakdown</SelectItem>
                <SelectItem value="detention">Detention</SelectItem>
                <SelectItem value="safety">Safety Concern</SelectItem>
                <SelectItem value="pay_dispute">Pay Dispute</SelectItem>
                <SelectItem value="document_issue">Document Issue</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Urgency *</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData({ ...formData, severity: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Can wait</SelectItem>
                <SelectItem value="medium">Medium - Need help soon</SelectItem>
                <SelectItem value="high">High - Need help now</SelectItem>
                <SelectItem value="urgent">Urgent - Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Brief Summary *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div>
            <Label>Details *</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Provide as much detail as possible. Include location, time, and what you need help with."
              rows={5}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={!formData.title || !formData.notes}
            >
              Submit Issue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}