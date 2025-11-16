import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AddPerformanceModal({ open, onClose, onSave, isLoading, employees = [] }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    review_period_start: "",
    review_period_end: "",
    review_date: "",
    overall_score: 3,
    category_scores: {
      quality_of_work: 3,
      productivity: 3,
      communication: 3,
      teamwork: 3,
      safety: 3,
      attendance: 3
    },
    strengths: "",
    areas_for_improvement: "",
    promotion_recommended: false,
    raise_recommended: false,
    raise_amount: "",
    notes: "",
    is_active: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Performance Review</DialogTitle>
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Review Period Start</Label>
              <Input
                type="date"
                value={formData.review_period_start}
                onChange={(e) => setFormData({ ...formData, review_period_start: e.target.value })}
              />
            </div>
            <div>
              <Label>Review Period End</Label>
              <Input
                type="date"
                value={formData.review_period_end}
                onChange={(e) => setFormData({ ...formData, review_period_end: e.target.value })}
              />
            </div>
            <div>
              <Label>Review Date *</Label>
              <Input
                type="date"
                required
                value={formData.review_date}
                onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
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
              required
              value={formData.overall_score}
              onChange={(e) => setFormData({ ...formData, overall_score: parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>Category Scores (1-5)</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(formData.category_scores).map((category) => (
                <div key={category} className="flex items-center gap-2">
                  <Label className="text-xs capitalize w-32">{category.replace(/_/g, ' ')}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-20"
                    value={formData.category_scores[category]}
                    onChange={(e) => setFormData({
                      ...formData,
                      category_scores: {
                        ...formData.category_scores,
                        [category]: parseFloat(e.target.value)
                      }
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Strengths</Label>
            <Textarea
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label>Areas for Improvement</Label>
            <Textarea
              value={formData.areas_for_improvement}
              onChange={(e) => setFormData({ ...formData, areas_for_improvement: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="promotion"
                checked={formData.promotion_recommended}
                onChange={(e) => setFormData({ ...formData, promotion_recommended: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="promotion" className="cursor-pointer">Promotion Recommended</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="raise"
                checked={formData.raise_recommended}
                onChange={(e) => setFormData({ ...formData, raise_recommended: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="raise" className="cursor-pointer">Raise Recommended</Label>
            </div>
            {formData.raise_recommended && (
              <div>
                <Label>Raise Amount</Label>
                <Input
                  type="number"
                  value={formData.raise_amount}
                  onChange={(e) => setFormData({ ...formData, raise_amount: parseFloat(e.target.value) })}
                />
              </div>
            )}
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}