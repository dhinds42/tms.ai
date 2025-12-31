import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Truck, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LaneBuilder({ actorType, actorId, onComplete }) {
  const [step, setStep] = useState(1);
  const [laneData, setLaneData] = useState({
    actor_type: actorType,
    actor_id: actorId,
    origin_city: '',
    origin_state: '',
    origin_radius_miles: 50,
    destination_city: '',
    destination_state: '',
    destination_radius_miles: 50,
    equipment_type: 'dry_van',
    max_deadhead_miles: 100,
    days_available: [],
    is_active: true
  });
  
  const [assumptionData, setAssumptionData] = useState({
    estimated_loaded_miles: 500,
    estimated_deadhead_miles: 50,
    avg_speed_mph: 50,
    accessorial_allowance_cents: 0,
    assumptions_source: 'manual'
  });
  
  const queryClient = useQueryClient();
  
  const createLaneMutation = useMutation({
    mutationFn: async () => {
      // Create lane preference
      const laneResult = await base44.entities.LanePreference.create(laneData);
      
      // Create assumption
      await base44.entities.LaneAssumption.create({
        ...assumptionData,
        lane_preference_id: laneResult.id
      });
      
      return laneResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['lanePreferences'] });
      if (onComplete) onComplete(result);
    }
  });
  
  const handleNext = () => {
    if (step === 1 && (!laneData.origin_city || !laneData.destination_city)) {
      alert('Please fill in origin and destination');
      return;
    }
    setStep(step + 1);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    createLaneMutation.mutate();
  };
  
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-indigo-600" />
          Create Lane Preference - Step {step} of 2
        </CardTitle>
        <div className="flex gap-2 mt-4">
          <Badge variant={step >= 1 ? "default" : "outline"}>1. Lane Details</Badge>
          <Badge variant={step >= 2 ? "default" : "outline"}>2. Assumptions</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Lane Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Origin City *</Label>
                  <Input
                    value={laneData.origin_city}
                    onChange={(e) => setLaneData({...laneData, origin_city: e.target.value})}
                    placeholder="Chicago"
                    required
                  />
                </div>
                <div>
                  <Label>Origin State *</Label>
                  <Input
                    value={laneData.origin_state}
                    onChange={(e) => setLaneData({...laneData, origin_state: e.target.value})}
                    placeholder="IL"
                    maxLength={2}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label>Origin Pickup Radius (miles)</Label>
                <Input
                  type="number"
                  value={laneData.origin_radius_miles}
                  onChange={(e) => setLaneData({...laneData, origin_radius_miles: Number(e.target.value)})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Destination City *</Label>
                  <Input
                    value={laneData.destination_city}
                    onChange={(e) => setLaneData({...laneData, destination_city: e.target.value})}
                    placeholder="Dallas"
                    required
                  />
                </div>
                <div>
                  <Label>Destination State *</Label>
                  <Input
                    value={laneData.destination_state}
                    onChange={(e) => setLaneData({...laneData, destination_state: e.target.value})}
                    placeholder="TX"
                    maxLength={2}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label>Destination Delivery Radius (miles)</Label>
                <Input
                  type="number"
                  value={laneData.destination_radius_miles}
                  onChange={(e) => setLaneData({...laneData, destination_radius_miles: Number(e.target.value)})}
                />
              </div>
              
              <div>
                <Label>Equipment Type *</Label>
                <Select value={laneData.equipment_type} onValueChange={(value) => setLaneData({...laneData, equipment_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dry_van">Dry Van</SelectItem>
                    <SelectItem value="reefer">Reefer</SelectItem>
                    <SelectItem value="flatbed">Flatbed</SelectItem>
                    <SelectItem value="step_deck">Step Deck</SelectItem>
                    <SelectItem value="box_truck">Box Truck</SelectItem>
                    <SelectItem value="cargo_van">Cargo Van</SelectItem>
                    <SelectItem value="sprinter">Sprinter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Max Deadhead Miles Willing to Drive</Label>
                <Input
                  type="number"
                  value={laneData.max_deadhead_miles}
                  onChange={(e) => setLaneData({...laneData, max_deadhead_miles: Number(e.target.value)})}
                />
              </div>
              
              <Button type="button" onClick={handleNext} className="w-full">
                Next: Add Mileage Assumptions
              </Button>
            </div>
          )}
          
          {/* Step 2: Assumptions */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Estimated Loaded Miles *</Label>
                <Input
                  type="number"
                  value={assumptionData.estimated_loaded_miles}
                  onChange={(e) => setAssumptionData({...assumptionData, estimated_loaded_miles: Number(e.target.value)})}
                  placeholder="500"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Expected distance for loaded portion of trip</p>
              </div>
              
              <div>
                <Label>Estimated Deadhead Miles</Label>
                <Input
                  type="number"
                  value={assumptionData.estimated_deadhead_miles}
                  onChange={(e) => setAssumptionData({...assumptionData, estimated_deadhead_miles: Number(e.target.value)})}
                  placeholder="50"
                />
                <p className="text-xs text-slate-500 mt-1">Expected empty miles to pickup or after delivery</p>
              </div>
              
              <div>
                <Label>Average Speed (mph)</Label>
                <Input
                  type="number"
                  value={assumptionData.avg_speed_mph}
                  onChange={(e) => setAssumptionData({...assumptionData, avg_speed_mph: Number(e.target.value)})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                  disabled={createLaneMutation.isPending}
                >
                  {createLaneMutation.isPending ? 'Creating...' : 'Create Lane'}
                </Button>
              </div>
            </div>
          )}
          
        </form>
      </CardContent>
    </Card>
  );
}