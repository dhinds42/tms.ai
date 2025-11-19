import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Ship, Train, Truck, Package } from "lucide-react";

export default function MultiModalOrchestration() {
  const shipments = [
    { id: 1, ref: 'MM-001', modes: ['ocean', 'truck'], status: 'in_transit', progress: 65 },
    { id: 2, ref: 'MM-002', modes: ['air', 'truck'], status: 'customs', progress: 40 },
    { id: 3, ref: 'MM-003', modes: ['rail', 'truck'], status: 'completed', progress: 100 },
  ];

  const getModeIcon = (mode) => {
    const icons = {
      ocean: Ship,
      air: Plane,
      rail: Train,
      truck: Truck
    };
    const Icon = icons[mode] || Package;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent">
            Multi-Modal Orchestration
          </h1>
          <p className="text-slate-600 mt-2">Coordinate ocean/air/rail/truck with single control panel</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Shipments</p>
                  <p className="text-3xl font-bold text-cyan-600">{shipments.length}</p>
                </div>
                <Package className="w-12 h-12 text-cyan-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Ocean</p>
                  <p className="text-3xl font-bold text-blue-600">12</p>
                </div>
                <Ship className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Air</p>
                  <p className="text-3xl font-bold text-indigo-600">5</p>
                </div>
                <Plane className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Rail</p>
                  <p className="text-3xl font-bold text-emerald-600">8</p>
                </div>
                <Train className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Multi-Modal Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shipments.map(shipment => (
                <Card key={shipment.id} className="border border-cyan-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-lg">{shipment.ref}</p>
                        <div className="flex gap-2 mt-1">
                          {shipment.modes.map(mode => (
                            <Badge key={mode} variant="outline" className="flex items-center gap-1">
                              {getModeIcon(mode)}
                              {mode}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge className="bg-cyan-600">{shipment.status}</Badge>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-cyan-600 h-2 rounded-full"
                        style={{ width: `${shipment.progress}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}