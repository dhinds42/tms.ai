import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export default function CreateTemplateModal({ template, onSave, onClose, isLoading, operatingMode }) {
  const [formData, setFormData] = useState(template || {
    template_name: "",
    branch: "",
    pickup_location: { city: "", state: "", address: "", zip: "" },
    dropoff_location: { city: "", state: "", address: "", zip: "" },
    commodity: "",
    weight: "",
    equipment_type: "dry_van",
    customer_rate: "",
    carrier_pay: "",
    distance_miles: "",
    special_instructions: "",
    temperature_requirements: "",
    is_hazmat: false,
    priority: "medium",
    typical_pickup_time: "",
    typical_delivery_time: "",
    transit_days: "",
    tags: [],
    notes: "",
    is_favorite: false
  });

  const [tagInput, setTagInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Template Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Template Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template_name">Template Name *</Label>
                <Input
                  id="template_name"
                  value={formData.template_name}
                  onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                  placeholder="e.g., Chicago to LA - Electronics"
                  required
                />
              </div>
              <div>
                <Label htmlFor="branch">Branch (Optional)</Label>
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="e.g., Chicago Branch"
                />
              </div>
            </div>
          </div>

          {/* Pickup Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Pickup Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={formData.pickup_location?.city || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: { ...formData.pickup_location, city: e.target.value }
                  })}
                  placeholder="Chicago"
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={formData.pickup_location?.state || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: { ...formData.pickup_location, state: e.target.value }
                  })}
                  placeholder="IL"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input
                  value={formData.pickup_location?.address || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickup_location: { ...formData.pickup_location, address: e.target.value }
                  })}
                  placeholder="123 Main St"
                />
              </div>
            </div>
          </div>

          {/* Dropoff Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Dropoff Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={formData.dropoff_location?.city || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    dropoff_location: { ...formData.dropoff_location, city: e.target.value }
                  })}
                  placeholder="Los Angeles"
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={formData.dropoff_location?.state || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    dropoff_location: { ...formData.dropoff_location, state: e.target.value }
                  })}
                  placeholder="CA"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input
                  value={formData.dropoff_location?.address || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    dropoff_location: { ...formData.dropoff_location, address: e.target.value }
                  })}
                  placeholder="456 Oak Ave"
                />
              </div>
            </div>
          </div>

          {/* Load Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Load Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipment_type">Equipment Type *</Label>
                <select
                  id="equipment_type"
                  value={formData.equipment_type}
                  onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="cargo_van">Cargo Van</option>
                  <option value="sprinter">Sprinter</option>
                  <option value="box_truck">Box Truck</option>
                  <option value="dry_van">Dry Van</option>
                  <option value="reefer">Reefer</option>
                  <option value="flatbed">Flatbed</option>
                  <option value="step_deck">Step Deck</option>
                  <option value="lowboy">Lowboy</option>
                </select>
              </div>
              <div>
                <Label htmlFor="commodity">Commodity</Label>
                <Input
                  id="commodity"
                  value={formData.commodity}
                  onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                  placeholder="Electronics"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                  placeholder="25000"
                />
              </div>
              <div>
                <Label htmlFor="distance_miles">Distance (miles)</Label>
                <Input
                  id="distance_miles"
                  type="number"
                  value={formData.distance_miles}
                  onChange={(e) => setFormData({ ...formData, distance_miles: parseFloat(e.target.value) })}
                  placeholder="2000"
                />
              </div>
              <div>
                <Label htmlFor="customer_rate">Customer Rate ($)</Label>
                <Input
                  id="customer_rate"
                  type="number"
                  value={formData.customer_rate}
                  onChange={(e) => setFormData({ ...formData, customer_rate: parseFloat(e.target.value) })}
                  placeholder="3500"
                />
              </div>
              {operatingMode === 'broker' && (
                <div>
                  <Label htmlFor="carrier_pay">Carrier Pay ($)</Label>
                  <Input
                    id="carrier_pay"
                    type="number"
                    value={formData.carrier_pay}
                    onChange={(e) => setFormData({ ...formData, carrier_pay: parseFloat(e.target.value) })}
                    placeholder="2800"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="transit_days">Transit Days</Label>
                <Input
                  id="transit_days"
                  type="number"
                  value={formData.transit_days}
                  onChange={(e) => setFormData({ ...formData, transit_days: parseInt(e.target.value) })}
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="typical_pickup_time">Typical Pickup Time</Label>
                <Input
                  id="typical_pickup_time"
                  value={formData.typical_pickup_time}
                  onChange={(e) => setFormData({ ...formData, typical_pickup_time: e.target.value })}
                  placeholder="08:00 AM"
                />
              </div>
              <div>
                <Label htmlFor="typical_delivery_time">Typical Delivery Time</Label>
                <Input
                  id="typical_delivery_time"
                  value={formData.typical_delivery_time}
                  onChange={(e) => setFormData({ ...formData, typical_delivery_time: e.target.value })}
                  placeholder="05:00 PM"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                id="special_instructions"
                value={formData.special_instructions}
                onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                placeholder="Enter any special handling instructions..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_hazmat}
                  onChange={(e) => setFormData({ ...formData, is_hazmat: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Hazmat Load</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_favorite}
                  onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Mark as Favorite</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Tags</h3>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag (e.g., 'Recurring', 'Weekly')"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add Tag
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-indigo-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this template..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.template_name}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              {isLoading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}