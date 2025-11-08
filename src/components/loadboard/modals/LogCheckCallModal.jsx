import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function LogCheckCallModal({ load, onClose, onSave }) {
  const [formData, setFormData] = useState({
    contacted_by: "",
    contact_method: "phone",
    current_location: "",
    eta_update: "",
    notes: "",
    issues_reported: ""
  });

  const handleSave = () => {
    onSave({
      load_id: load.id,
      call_time: new Date().toISOString(),
      ...formData
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Log Check Call</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-slate-600">
              Load: <span className="font-semibold">{load.load_number || `LOAD-${load.id.slice(0, 8)}`}</span>
            </p>
            <p className="text-slate-600 mt-1">
              Status: <span className="font-semibold capitalize">{load.status}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contacted-by">Contacted By</Label>
              <Input
                id="contacted-by"
                value={formData.contacted_by}
                onChange={(e) => setFormData({ ...formData, contacted_by: e.target.value })}
                placeholder="Driver name"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="contact-method">Contact Method</Label>
              <select
                id="contact-method"
                value={formData.contact_method}
                onChange={(e) => setFormData({ ...formData, contact_method: e.target.value })}
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="phone">Phone Call</option>
                <option value="text">Text Message</option>
                <option value="email">Email</option>
                <option value="app">Mobile App</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="current-location">Current Location</Label>
            <Input
              id="current-location"
              value={formData.current_location}
              onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
              placeholder="City, State or Mile Marker"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="eta-update">ETA Update</Label>
            <Input
              id="eta-update"
              type="datetime-local"
              value={formData.eta_update}
              onChange={(e) => setFormData({ ...formData, eta_update: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="issues">Issues Reported</Label>
            <Textarea
              id="issues"
              value={formData.issues_reported}
              onChange={(e) => setFormData({ ...formData, issues_reported: e.target.value })}
              placeholder="Any delays, mechanical issues, or concerns..."
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Other details about the check call..."
              rows={4}
              className="mt-2"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            Save Check Call
          </Button>
        </div>
      </div>
    </div>
  );
}