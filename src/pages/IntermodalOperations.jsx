import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Train, Ship, Truck, Plane, TrendingUp } from "lucide-react";

export default function IntermodalOperations() {
  const { data: loads = [] } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 200),
    initialData: [],
  });

  const intermodalLoads = loads.filter(l => l.mode === 'intermodal');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Intermodal Operations
          </h1>
          <p className="text-slate-600 mt-2">Multi-modal transportation coordination and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Intermodal Loads</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{intermodalLoads.length}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Rail</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {loads.filter(l => l.mode === 'rail').length}
                  </p>
                </div>
                <Train className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Ocean</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {loads.filter(l => l.mode === 'ocean').length}
                  </p>
                </div>
                <Ship className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Air</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {loads.filter(l => l.mode === 'air').length}
                  </p>
                </div>
                <Plane className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Truck</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {loads.filter(l => l.mode === 'truck').length}
                  </p>
                </div>
                <Truck className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Active Intermodal Shipments</h3>
            {intermodalLoads.length === 0 ? (
              <div className="text-center py-12">
                <Train className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No active intermodal shipments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {intermodalLoads.map((load) => (
                  <div key={load.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{load.load_number}</h4>
                        <p className="text-sm text-slate-600">
                          {load.origin_city} → {load.destination_city}
                        </p>
                      </div>
                      <Badge className="bg-indigo-600">Intermodal</Badge>
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