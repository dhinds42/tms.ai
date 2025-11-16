import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AddPerformanceModal({ open, onClose, onSave, isLoading, employees = [] }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    review_date: new Date().toISOString().split('T')[0],
    review_period_start: "",
    review_period_end: "",
    reviewer_id: "",
    overall_score: "3",
    strengths: "",
    areas_for_improvement: "",
    promotion_recommended: false,
    raise_recommended: false,
    raise_amount: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      overall_score: parseFloat(formData.overall_score),
      raise_amount: formData.raise_amount ? parseFloat(formData.raise_amount) : undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Performance Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Employee *</Label>
            <select
              className="w-full border border-slate-300 rounded-md p-2"
              value={formData.employee_id}
              onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Review Date *</Label>
              <Input
                type="date"
                value={formData.review_date}
                onChange={(e) => setFormData({...formData, review_date: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Period Start</Label>
              <Input
                type="date"
                value={formData.review_period_start}
                onChange={(e) => setFormData({...formData, review_period_start: e.target.value})}
              />
            </div>
            <div>
              <Label>Period End</Label>
              <Input
                type="date"
                value={formData.review_period_end}
                onChange={(e) => setFormData({...formData, review_period_end: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label>Overall Score (1-5) *</Label>
            <Input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.overall_score}
              onChange={(e) => setFormData({...formData, overall_score: e.target.value})}
              required
            />
          </div>

          <div>
            <Label>Strengths</Label>
            <Textarea
              value={formData.strengths}
              onChange={(e) => setFormData({...formData, strengths: e.target.value})}
              placeholder="Key strengths and accomplishments..."
              rows={3}
            />
          </div>

          <div>
            <Label>Areas for Improvement</Label>
            <Textarea
              value={formData.areas_for_improvement}
              onChange={(e) => setFormData({...formData, areas_for_improvement: e.target.value})}
              placeholder="Areas where employee can improve..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.promotion_recommended}
                onChange={(e) => setFormData({...formData, promotion_recommended: e.target.checked})}
                className="w-4 h-4"
              />
              <Label>Recommend Promotion</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.raise_recommended}
                onChange={(e) => setFormData({...formData, raise_recommended: e.target.checked})}
                className="w-4 h-4"
              />
              <Label>Recommend Raise</Label>
            </div>
          </div>

          {formData.raise_recommended && (
            <div>
              <Label>Raise Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.raise_amount}
                onChange={(e) => setFormData({...formData, raise_amount: e.target.value})}
                placeholder="5000"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-pink-600">
              {isLoading ? "Adding..." : "Add Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}