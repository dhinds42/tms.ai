import React from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Thermometer } from "lucide-react";

export default function WarehouseManagement() {
  const { data: warehouses, isLoading } = useScopedEntity('Warehouse', { limit: 100 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            Warehouse Management
          </h1>
          <p className="text-slate-600 mt-2">WMS integration and inventory management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.id} className="border-0 shadow-xl">
              <CardHeader className="border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{warehouse.name}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1 capitalize">{warehouse.warehouse_type?.replace(/_/g, ' ')}</p>
                  </div>
                  {warehouse.temperature_controlled && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Thermometer className="w-3 h-3 mr-1" />
                      Temp Control
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Sq Ft</span>
                    <span className="font-semibold">{warehouse.total_sq_ft?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pallet Positions</span>
                    <span className="font-semibold">{warehouse.pallet_positions?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Dock Doors</span>
                    <span className="font-semibold">{warehouse.dock_doors_count || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}