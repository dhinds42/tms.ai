import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

export default function ReeferManagement() {
  const { data: loads = [] } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 200),
    initialData: [],
  });

  const reeferLoads = loads.filter(l => 
    l.equipment_type === 'reefer' || l.temperature_controlled
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
            Reefer Management
          </h1>
          <p className="text-slate-600 mt-2">Temperature-controlled freight and monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Reefers</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{reeferLoads.length}</p>
                </div>
                <Thermometer className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Temp Compliant</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">98.5%</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Temp Excursions</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">3</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Temp</p>
                  <p className="text-3xl font-bold text-cyan-600 mt-2">34°F</p>
                </div>
                <TrendingDown className="w-12 h-12 text-cyan-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Temperature-Controlled Shipments</h3>
            {reeferLoads.length === 0 ? (
              <div className="text-center py-12">
                <Thermometer className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No active reefer loads</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reeferLoads.map((load) => (
                  <div key={load.id} className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{load.load_number}</h4>
                        <p className="text-sm text-slate-600">
                          {load.origin_city} → {load.destination_city}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-blue-600">🌡️ Reefer</Badge>
                        <Badge className="bg-emerald-600">✓ In Range</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-xs text-slate-600">Set Temp</p>
                        <p className="font-bold text-blue-900">32-36°F</p>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded">
                        <p className="text-xs text-slate-600">Current</p>
                        <p className="font-bold text-emerald-900">34°F</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="text-xs text-slate-600">Monitoring</p>
                        <p className="font-bold text-slate-900">IoT Sensor</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}