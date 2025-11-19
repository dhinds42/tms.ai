import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Car } from "lucide-react";

export default function VehicleLoadManager() {
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vin: '', year: '', make: '', model: '', operable: true
  });

  const queryClient = useQueryClient();

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list('-created_date', 100),
    initialData: [],
  });

  const createVehicleMutation = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowAddVehicle(false);
      setNewVehicle({ vin: '', year: '', make: '', model: '', operable: true });
    },
  });

  return (
    <div className="space-y-6">
      
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vehicle Inventory</CardTitle>
            <Button onClick={() => setShowAddVehicle(true)} className="bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No vehicles in system</p>
              </div>
            ) : (
              vehicles.map(vehicle => (
                <div key={vehicle.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-bold text-orange-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-sm text-orange-700">VIN: {vehicle.vin}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={vehicle.operable ? 'bg-emerald-600' : 'bg-red-600'}>
                      {vehicle.operable ? 'Operable' : 'Inoperable'}
                    </Badge>
                    <Badge className="bg-orange-600">{vehicle.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>Add Vehicle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>VIN *</Label>
                <Input
                  value={newVehicle.vin}
                  onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value})}
                  placeholder="1HGBH41JXMN109186"
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                    placeholder="2024"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Make</Label>
                  <Input
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                    placeholder="Ford"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                    placeholder="F-150"
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => createVehicleMutation.mutate(newVehicle)}
                  disabled={!newVehicle.vin}
                  className="flex-1 bg-orange-600"
                >
                  Save Vehicle
                </Button>
                <Button onClick={() => setShowAddVehicle(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}