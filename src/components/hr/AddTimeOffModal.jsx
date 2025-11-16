import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddTimeOffModal({ open, onClose, onSave, isLoading, employees = [] }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    request_type: "vacation",
    start_date: "",
    end_date: "",
    total_days: "",
    status: "pending",
    reason: ""
  });

  const calculateDays = (start, end) => {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleDateChange = (field, value) => {
    const newData = {...formData, [field]: value};
    if (newData.start_date && newData.end_date) {
      newData.total_days = calculateDays(newData.start_date, newData.end_date);
    }
    setFormData(newData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      total_days: parseInt(formData.total_days)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Time Off Request</DialogTitle>
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

          <div>
            <Label>Request Type *</Label>
            <Select value={formData.request_type} onValueChange={(val) => setFormData({...formData, request_type: val})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal Day</SelectItem>
                <SelectItem value="bereavement">Bereavement</SelectItem>
                <SelectItem value="unpaid">Unpaid Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleDateChange('start_date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>End Date *</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleDateChange('end_date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Total Days</Label>
              <Input
                type="number"
                value={formData.total_days}
                onChange={(e) => setFormData({...formData, total_days: e.target.value})}
                readOnly
                className="bg-slate-50"
              />
            </div>
          </div>

          <div>
            <Label>Reason</Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="Reason for time off request..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600">
              {isLoading ? "Adding..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}