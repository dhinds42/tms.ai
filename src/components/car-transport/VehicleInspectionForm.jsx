import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, CheckCircle } from "lucide-react";

export default function VehicleInspectionForm({ vehicle, onInspectionComplete }) {
  const [inspection, setInspection] = useState({
    pre_trip_photos: [],
    exterior_condition: "",
    interior_condition: "",
    tire_condition: "",
    fuel_level: "",
    mileage: "",
    damage_notes: "",
    inspector_signature: ""
  });

  const handleSubmit = () => {
    const inspectionData = {
      ...inspection,
      vehicle_id: vehicle.id,
      inspection_date: new Date().toISOString(),
      inspection_type: "pre_transport"
    };
    
    onInspectionComplete?.(inspectionData);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-600" />
          Vehicle Inspection Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="font-semibold text-indigo-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
          <p className="text-sm text-indigo-700">VIN: {vehicle.vin}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Exterior Condition</label>
            <select
              value={inspection.exterior_condition}
              onChange={(e) => setInspection({...inspection, exterior_condition: e.target.value})}
              className="w-full mt-2 p-2 border border-slate-300 rounded"
            >
              <option value="">Select...</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Interior Condition</label>
            <select
              value={inspection.interior_condition}
              onChange={(e) => setInspection({...inspection, interior_condition: e.target.value})}
              className="w-full mt-2 p-2 border border-slate-300 rounded"
            >
              <option value="">Select...</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Tire Condition</label>
            <select
              value={inspection.tire_condition}
              onChange={(e) => setInspection({...inspection, tire_condition: e.target.value})}
              className="w-full mt-2 p-2 border border-slate-300 rounded"
            >
              <option value="">Select...</option>
              <option value="good">Good</option>
              <option value="worn">Worn</option>
              <option value="needs_replacement">Needs Replacement</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Fuel Level</label>
            <select
              value={inspection.fuel_level}
              onChange={(e) => setInspection({...inspection, fuel_level: e.target.value})}
              className="w-full mt-2 p-2 border border-slate-300 rounded"
            >
              <option value="">Select...</option>
              <option value="full">Full</option>
              <option value="3/4">3/4</option>
              <option value="1/2">1/2</option>
              <option value="1/4">1/4</option>
              <option value="empty">Empty</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Mileage</label>
          <input
            type="number"
            value={inspection.mileage}
            onChange={(e) => setInspection({...inspection, mileage: e.target.value})}
            placeholder="Current mileage"
            className="w-full mt-2 p-2 border border-slate-300 rounded"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Damage Notes</label>
          <Textarea
            value={inspection.damage_notes}
            onChange={(e) => setInspection({...inspection, damage_notes: e.target.value})}
            placeholder="Document any existing damage, scratches, dents, etc."
            className="mt-2 h-24"
          />
        </div>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-900">
            <strong>📸 Photo Documentation Required:</strong><br/>
            Take photos of all 4 sides, dashboard/odometer, and any pre-existing damage
          </p>
        </div>

        <Button onClick={handleSubmit} className="w-full bg-indigo-600">
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete Inspection
        </Button>

      </CardContent>
    </Card>
  );
}