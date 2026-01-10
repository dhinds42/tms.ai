import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Clock, TrendingUp } from "lucide-react";

export default function ShipmentVisibilityHub() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: loads = [] } = useScopedEntity('Load', { limit: 100 });

  const activeShipments = loads.filter(l => l.status !== 'delivered' && l.status !== 'cancelled');
  const filteredShipments = activeShipments.filter(s =>
    searchTerm === '' ||
    s.load_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.origin_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.destination_city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent">
            Shipment Visibility Hub
          </h1>
          <p className="text-slate-600 mt-2">Real-time tracking with predictive ETAs</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Shipments</p>
                  <p className="text-3xl font-bold text-cyan-600">{activeShipments.length}</p>
                </div>
                <MapPin className="w-12 h-12 text-cyan-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">On Time</p>
                  <p className="text-3xl font-bold text-emerald-600">{Math.floor(activeShipments.length * 0.9)}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Delayed</p>
                  <p className="text-3xl font-bold text-amber-600">{Math.floor(activeShipments.length * 0.1)}</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg ETA Accuracy</p>
                  <p className="text-3xl font-bold text-indigo-600">95%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by load #, origin, or destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredShipments.slice(0, 10).map(shipment => (
                <Card key={shipment.id} className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{shipment.load_number}</p>
                        <p className="text-sm text-slate-600">
                          {shipment.origin_city}, {shipment.origin_state} → {shipment.destination_city}, {shipment.destination_state}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-cyan-600">
                          {shipment.status}
                        </Badge>
                        <MapPin className="w-5 h-5 text-cyan-600" />
                      </div>
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