import React from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, FileText, Award } from "lucide-react";

import HazmatShipmentMonitor from "../components/hazmat/HazmatShipmentMonitor";

export default function HazmatCompliance() {
  const { data: loads = [] } = useScopedEntity('Load', { limit: 200 });

  const hazmatLoads = loads.filter(l => l.is_hazmat);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-red-900 to-orange-900 bg-clip-text text-transparent">
            Hazmat Compliance
          </h1>
          <p className="text-slate-600 mt-2">Dangerous goods and hazardous materials management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Hazmat Loads</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{hazmatLoads.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Certified Drivers</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">42</p>
                </div>
                <Award className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Compliance Rate</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">99.8%</p>
                </div>
                <Shield className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Placards</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">147</p>
                </div>
                <FileText className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900">⚠️ Hazmat Compliance Requirements</h3>
                <p className="text-sm text-slate-600 mt-1">
                  All hazmat shipments require proper placarding, documentation, and DOT certification
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Active Hazmat Shipments</h3>
            {hazmatLoads.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No active hazmat shipments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hazmatLoads.map((load) => (
                  <div key={load.id} className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{load.load_number}</h4>
                        <p className="text-sm text-slate-600">
                          {load.origin_city} → {load.destination_city}
                        </p>
                      </div>
                      <Badge className="bg-red-600">⚠️ HAZMAT</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hazmat Shipment Monitor */}
        <HazmatShipmentMonitor />

      </div>
    </div>
  );
}