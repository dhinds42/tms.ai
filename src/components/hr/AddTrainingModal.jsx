import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddTrainingModal({ open, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    training_type: "defensive_driving",
    training_provider: "",
    completed_on: "",
    expires_on: "",
    score: "",
    pass_fail: "pass",
    certificate_number: "",
    cost: "",
    hours: "",
    trainer_name: "",
    notes: "",
    is_active: true
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 100),
    initialData: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Training Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Employee *</Label>
            <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Training Type *</Label>
            <Select value={formData.training_type} onValueChange={(value) => setFormData({ ...formData, training_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defensive_driving">Defensive Driving</SelectItem>
                <SelectItem value="hazmat">Hazmat</SelectItem>
                <SelectItem value="food_safety">Food Safety</SelectItem>
                <SelectItem value="security_awareness">Security Awareness</SelectItem>
                <SelectItem value="hos_compliance">HOS Compliance</SelectItem>
                <SelectItem value="eld_training">ELD Training</SelectItem>
                <SelectItem value="cargo_securement">Cargo Securement</SelectItem>
                <SelectItem value="winter_driving">Winter Driving</SelectItem>
                <SelectItem value="customer_service">Customer Service</SelectItem>
                <SelectItem value="safety_orientation">Safety Orientation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Training Provider</Label>
              <Input
                value={formData.training_provider}
                onChange={(e) => setFormData({ ...formData, training_provider: e.target.value })}
              />
            </div>
            <div>
              <Label>Trainer Name</Label>
              <Input
                value={formData.trainer_name}
                onChange={(e) => setFormData({ ...formData, trainer_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Completed On *</Label>
              <Input
                type="date"
                required
                value={formData.completed_on}
                onChange={(e) => setFormData({ ...formData, completed_on: e.target.value })}
              />
            </div>
            <div>
              <Label>Expires On</Label>
              <Input
                type="date"
                value={formData.expires_on}
                onChange={(e) => setFormData({ ...formData, expires_on: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Score</Label>
              <Input
                type="number"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Pass/Fail</Label>
              <Select value={formData.pass_fail} onValueChange={(value) => setFormData({ ...formData, pass_fail: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                  <SelectItem value="n/a">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hours</Label>
              <Input
                type="number"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Certificate Number</Label>
              <Input
                value={formData.certificate_number}
                onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Cost</Label>
              <Input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Training"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}