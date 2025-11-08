import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Save, Star, Trash2 } from "lucide-react";

export default function AdvancedLoadFilters({ 
  filters, 
  setFilters, 
  onApply,
  onReset 
}) {
  const [savedPresets, setSavedPresets] = useState(() => {
    const saved = localStorage.getItem('load_filter_presets');
    return saved ? JSON.parse(saved) : [];
  });
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const savePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    const newPreset = {
      id: Date.now().toString(),
      name: presetName,
      filters: { ...filters }
    };

    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    localStorage.setItem('load_filter_presets', JSON.stringify(updated));
    setPresetName('');
    setShowSavePreset(false);
    alert('Filter preset saved!');
  };

  const loadPreset = (preset) => {
    setFilters(preset.filters);
    onApply();
  };

  const deletePreset = (presetId) => {
    const updated = savedPresets.filter(p => p.id !== presetId);
    setSavedPresets(updated);
    localStorage.setItem('load_filter_presets', JSON.stringify(updated));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      
      {/* Saved Presets */}
      {savedPresets.length > 0 && (
        <div>
          <Label className="mb-3 block">Saved Filter Presets</Label>
          <div className="flex flex-wrap gap-2">
            {savedPresets.map(preset => (
              <div key={preset.id} className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadPreset(preset)}
                  className="border-indigo-300 text-indigo-700"
                >
                  <Star className="w-3 h-3 mr-1" />
                  {preset.name}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deletePreset(preset.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Filters */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-indigo-900 mb-4">Location Filters</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Pickup City</Label>
              <Input
                placeholder="e.g., Los Angeles"
                value={filters.pickupCity || ''}
                onChange={(e) => handleFilterChange('pickupCity', e.target.value)}
              />
            </div>
            <div>
              <Label>Pickup State</Label>
              <Input
                placeholder="e.g., CA"
                value={filters.pickupState || ''}
                onChange={(e) => handleFilterChange('pickupState', e.target.value)}
              />
            </div>
            <div>
              <Label>Dropoff City</Label>
              <Input
                placeholder="e.g., Dallas"
                value={filters.dropoffCity || ''}
                onChange={(e) => handleFilterChange('dropoffCity', e.target.value)}
              />
            </div>
            <div>
              <Label>Dropoff State</Label>
              <Input
                placeholder="e.g., TX"
                value={filters.dropoffState || ''}
                onChange={(e) => handleFilterChange('dropoffState', e.target.value)}
              />
            </div>
            <div>
              <Label>Distance Radius (miles)</Label>
              <Input
                type="number"
                placeholder="50"
                value={filters.radiusMiles || ''}
                onChange={(e) => handleFilterChange('radiusMiles', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Load Details */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-4">Load Details</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Equipment Type</Label>
              <Select 
                value={filters.equipment || 'all'} 
                onValueChange={(value) => handleFilterChange('equipment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Equipment</SelectItem>
                  <SelectItem value="cargo_van">Cargo Van</SelectItem>
                  <SelectItem value="sprinter">Sprinter</SelectItem>
                  <SelectItem value="box_truck">Box Truck</SelectItem>
                  <SelectItem value="dry_van">Dry Van</SelectItem>
                  <SelectItem value="reefer">Reefer</SelectItem>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                  <SelectItem value="step_deck">Step Deck</SelectItem>
                  <SelectItem value="lowboy">Lowboy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select 
                value={filters.priority || 'all'} 
                onValueChange={(value) => handleFilterChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Commodity</Label>
              <Input
                placeholder="e.g., Electronics"
                value={filters.commodity || ''}
                onChange={(e) => handleFilterChange('commodity', e.target.value)}
              />
            </div>

            <div>
              <Label>Min Weight (lbs)</Label>
              <Input
                type="number"
                placeholder="1000"
                value={filters.minWeight || ''}
                onChange={(e) => handleFilterChange('minWeight', e.target.value)}
              />
            </div>

            <div>
              <Label>Max Weight (lbs)</Label>
              <Input
                type="number"
                placeholder="45000"
                value={filters.maxWeight || ''}
                onChange={(e) => handleFilterChange('maxWeight', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate & Distance */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-emerald-900 mb-4">Rate & Distance</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Min Rate ($)</Label>
              <Input
                type="number"
                placeholder="500"
                value={filters.minRate || ''}
                onChange={(e) => handleFilterChange('minRate', e.target.value)}
              />
            </div>

            <div>
              <Label>Max Rate ($)</Label>
              <Input
                type="number"
                placeholder="5000"
                value={filters.maxRate || ''}
                onChange={(e) => handleFilterChange('maxRate', e.target.value)}
              />
            </div>

            <div>
              <Label>Min Distance (mi)</Label>
              <Input
                type="number"
                placeholder="50"
                value={filters.minDistance || ''}
                onChange={(e) => handleFilterChange('minDistance', e.target.value)}
              />
            </div>

            <div>
              <Label>Max Distance (mi)</Label>
              <Input
                type="number"
                placeholder="2000"
                value={filters.maxDistance || ''}
                onChange={(e) => handleFilterChange('maxDistance', e.target.value)}
              />
            </div>

            <div>
              <Label>Min Rate/Mile</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="1.50"
                value={filters.minRateMile || ''}
                onChange={(e) => handleFilterChange('minRateMile', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Range */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-purple-900 mb-4">Date Range</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Pickup From</Label>
              <Input
                type="date"
                value={filters.pickupFrom || ''}
                onChange={(e) => handleFilterChange('pickupFrom', e.target.value)}
              />
            </div>

            <div>
              <Label>Pickup To</Label>
              <Input
                type="date"
                value={filters.pickupTo || ''}
                onChange={(e) => handleFilterChange('pickupTo', e.target.value)}
              />
            </div>

            <div>
              <Label>Delivery From</Label>
              <Input
                type="date"
                value={filters.deliveryFrom || ''}
                onChange={(e) => handleFilterChange('deliveryFrom', e.target.value)}
              />
            </div>

            <div>
              <Label>Delivery To</Label>
              <Input
                type="date"
                value={filters.deliveryTo || ''}
                onChange={(e) => handleFilterChange('deliveryTo', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Requirements */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-amber-900 mb-4">Special Requirements</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.hazmatOnly || false}
                onChange={(e) => handleFilterChange('hazmatOnly', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Hazmat Only</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.teamRequired || false}
                onChange={(e) => handleFilterChange('teamRequired', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Team Drivers Required</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.temperatureControlled || false}
                onChange={(e) => handleFilterChange('temperatureControlled', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Temperature Controlled</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onApply}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
        >
          Apply Filters
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          className="border-slate-300"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All
        </Button>

        <Button
          onClick={() => setShowSavePreset(!showSavePreset)}
          variant="outline"
          className="border-emerald-300 text-emerald-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save as Preset
        </Button>
      </div>

      {/* Save Preset Form */}
      {showSavePreset && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4">
            <Label>Preset Name</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="e.g., California Runs"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
              <Button onClick={savePreset} className="bg-emerald-600">
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Summary */}
      {Object.keys(filters).some(key => filters[key] && filters[key] !== 'all') && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.keys(filters).map(key => {
                const value = filters[key];
                if (!value || value === 'all') return null;
                
                return (
                  <Badge key={key} className="bg-blue-600 text-white">
                    {key}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => handleFilterChange(key, '')}
                    />
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}