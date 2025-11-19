import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Car, MapPin, Clock } from "lucide-react";

export default function DealerPortalAccess() {
  const [selectedDealer, setSelectedDealer] = useState(null);

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list('-created_date', 50),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 50),
    initialData: [],
  });

  // Group vehicles by dealer (mock - in production would link to dealer entity)
  const dealerVehicles = vehicles.reduce((acc, vehicle) => {
    const dealer = vehicle.pickup_location_id || 'Unknown Dealer';
    if (!acc[dealer]) acc[dealer] = [];
    acc[dealer].push(vehicle);
    return acc;
  }, {});

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" />
          Dealer Portal Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Dealer Self-Service Features:</strong><br/>
            View vehicle inventory, track shipments, schedule pickups, manage delivery preferences
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <p className="text-sm text-slate-600">Total Dealers</p>
            <p className="text-3xl font-bold text-slate-900">{Object.keys(dealerVehicles).length}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <p className="text-sm text-slate-600">Vehicles in System</p>
            <p className="text-3xl font-bold text-slate-900">{vehicles.length}</p>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(dealerVehicles).slice(0, 5).map(([dealer, dealerVehicles]) => (
            <div 
              key={dealer}
              className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
              onClick={() => setSelectedDealer(dealer)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{dealer}</p>
                  <p className="text-sm text-slate-600">{dealerVehicles.length} vehicles</p>
                </div>
                <Badge className="bg-blue-600">
                  <Car className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {selectedDealer && dealerVehicles[selectedDealer] && (
          <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-300">
            <h4 className="font-semibold text-indigo-900 mb-3">
              {selectedDealer} - Vehicle Inventory
            </h4>
            <div className="space-y-2">
              {dealerVehicles[selectedDealer].map((vehicle) => (
                <div key={vehicle.id} className="p-3 bg-white rounded border border-indigo-200">
                  <p className="font-semibold text-sm">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-xs text-slate-600">VIN: {vehicle.vin}</p>
                  <Badge className={
                    vehicle.status === 'delivered' ? 'bg-emerald-600' :
                    vehicle.status === 'in_transit' ? 'bg-blue-600' : 'bg-amber-600'
                  }>
                    {vehicle.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}