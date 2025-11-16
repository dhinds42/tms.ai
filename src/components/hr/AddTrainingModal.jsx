import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddTrainingModal({ open, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    training_type: "defensive_driving",
    training_provider: "",
    completed_on: "",
    expires_on: "",
    pass_fail: "pass",
    cost: "",
    hours: "",
    trainer_name: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      hours: formData.hours ? parseFloat(formData.hours) : undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Training Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Training Type *</Label>
            <Select value={formData.training_type} onValueChange={(val) => setFormData({...formData, training_type: val})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defensive_driving">Defensive Driving</SelectItem>
                <SelectItem value="hazmat">HAZMAT</SelectItem>
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
                onChange={(e) => setFormData({...formData, training_provider: e.target.value})}
                placeholder="Training Company Name"
              />
            </div>
            <div>
              <Label>Trainer Name</Label>
              <Input
                value={formData.trainer_name}
                onChange={(e) => setFormData({...formData, trainer_name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Completed On *</Label>
              <Input
                type="date"
                value={formData.completed_on}
                onChange={(e) => setFormData({...formData, completed_on: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Expires On</Label>
              <Input
                type="date"
                value={formData.expires_on}
                onChange={(e) => setFormData({...formData, expires_on: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Pass/Fail</Label>
              <Select value={formData.pass_fail} onValueChange={(val) => setFormData({...formData, pass_fail: val})}>
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
                step="0.5"
                value={formData.hours}
                onChange={(e) => setFormData({...formData, hours: e.target.value})}
                placeholder="8"
              />
            </div>
            <div>
              <Label>Cost ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                placeholder="500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-cyan-600">
              {isLoading ? "Adding..." : "Add Training Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}