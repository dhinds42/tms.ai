import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Users, MapPin, CheckCircle } from "lucide-react";

export default function AutoHaulerDispatch() {
  const [assignments, setAssignments] = useState({});

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list('-created_date', 100),
    initialData: [],
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    initialData: [],
  });

  const pendingVehicles = vehicles.filter(v => v.status === 'pending');
  const autoHaulerDrivers = drivers.filter(d => d.status === 'available');

  const assignVehiclesToDriver = (vehicleIds, driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    setAssignments({
      ...assignments,
      [driverId]: {
        driver: driver,
        vehicles: vehicleIds.map(vId => vehicles.find(v => v.id === vId))
      }
    });

    alert(`Assigned ${vehicleIds.length} vehicles to ${driver.first_name} ${driver.last_name}`);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-orange-600" />
          Auto Hauler Dispatch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-amber-50 rounded border border-amber-200">
            <p className="text-sm text-amber-900 font-semibold">Pending Vehicles</p>
            <p className="text-3xl font-bold text-amber-600">{pendingVehicles.length}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-900 font-semibold">Available Drivers</p>
            <p className="text-3xl font-bold text-blue-600">{autoHaulerDrivers.length}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-sm text-emerald-900 font-semibold">Dispatched Today</p>
            <p className="text-3xl font-bold text-emerald-600">{Object.keys(assignments).length}</p>
          </div>
        </div>

        {/* Quick Dispatch */}
        {pendingVehicles.length > 0 && autoHaulerDrivers.length > 0 && (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-3">Quick Dispatch</h4>
            <div className="space-y-2">
              {autoHaulerDrivers.slice(0, 3).map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-3 bg-white rounded border border-orange-200">
                  <div>
                    <p className="font-semibold">{driver.first_name} {driver.last_name}</p>
                    <p className="text-xs text-slate-600">
                      {driver.current_location?.city || 'Unknown'}, {driver.current_location?.state || '--'}
                    </p>
                  </div>
                  <Button
                    onClick={() => assignVehiclesToDriver(
                      pendingVehicles.slice(0, 6).map(v => v.id),
                      driver.id
                    )}
                    size="sm"
                    className="bg-orange-600"
                  >
                    Assign {Math.min(6, pendingVehicles.length)} Vehicles
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Assignments */}
        {Object.keys(assignments).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Current Dispatch Assignments</h4>
            {Object.values(assignments).map((assignment, idx) => (
              <div key={idx} className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-300">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-emerald-900">
                      {assignment.driver.first_name} {assignment.driver.last_name}
                    </p>
                    <p className="text-sm text-emerald-700">
                      {assignment.vehicles.length} vehicles assigned
                    </p>
                  </div>
                  <Badge className="bg-emerald-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Dispatched
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {assignment.vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="p-2 bg-white rounded border border-emerald-200 text-xs">
                      <p className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                      <p className="text-slate-600">VIN: {vehicle.vin}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}