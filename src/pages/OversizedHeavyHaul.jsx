import React from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Ruler, Weight, FileText } from "lucide-react";

import PermitManager from "../components/oversized/PermitManager";

export default function OversizedHeavyHaul() {
  const { data: loads = [] } = useScopedEntity('Load', { limit: 200 });

  const oversizedLoads = loads.filter(l => 
    l.requires_permits || l.is_oversized
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            Oversized / Heavy Haul
          </h1>
          <p className="text-slate-600 mt-2">Specialized equipment and permit management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Oversized Loads</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{oversizedLoads.length}</p>
                </div>
                <Truck className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Permits</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">27</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Weight</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">62k</p>
                </div>
                <Weight className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Max Dimensions</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">14'</p>
                </div>
                <Ruler className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-l-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-bold text-purple-900">📋 Permit Requirements</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Oversized loads require state permits, escort vehicles, and route surveys
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Active Oversized Loads</h3>
            {oversizedLoads.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No active oversized loads</p>
              </div>
            ) : (
              <div className="space-y-3">
                {oversizedLoads.map((load) => (
                  <div key={load.id} className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{load.load_number}</h4>
                        <p className="text-sm text-slate-600">
                          {load.origin_city} → {load.destination_city}
                        </p>
                      </div>
                      <Badge className="bg-purple-600">OVERSIZED</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permit Manager */}
        <PermitManager />

      </div>
    </div>
  );
}