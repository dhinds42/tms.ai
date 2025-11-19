import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Clock, Truck, Package, TrendingUp } from "lucide-react";

import CrossDockScheduler from "../components/crossdock/CrossDockScheduler";

export default function CrossDockOperations() {
  const { data: loads = [] } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 200),
    initialData: [],
  });

  const { data: dockDoors = [] } = useQuery({
    queryKey: ['dockDoors'],
    queryFn: () => base44.entities.DockDoor.list('-created_date', 100),
    initialData: [],
  });

  const crossDockLoads = loads.filter(l => 
    l.stops?.some(s => s.stop_type === 'crossdock')
  );

  const activeDoors = dockDoors.filter(d => d.status === 'occupied').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-orange-900 to-red-900 bg-clip-text text-transparent">
            Cross-Dock Operations
          </h1>
          <p className="text-slate-600 mt-2">Real-time dock door management and freight transfer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Transfers</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{crossDockLoads.length}</p>
                </div>
                <ArrowLeftRight className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Dock Doors Active</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{activeDoors}/{dockDoors.length}</p>
                </div>
                <Truck className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Dwell Time</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">1.2h</p>
                </div>
                <Clock className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Daily Throughput</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">147</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Active Cross-Dock Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            {crossDockLoads.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No active cross-dock operations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {crossDockLoads.map((load) => (
                  <div key={load.id} className="p-4 border border-slate-200 rounded-lg hover:bg-orange-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{load.load_number}</h4>
                        <p className="text-sm text-slate-600">
                          {load.origin_city} → Cross-Dock → {load.destination_city}
                        </p>
                      </div>
                      <Badge className="bg-orange-600">In Transfer</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cross-Dock Scheduler */}
        <CrossDockScheduler />

      </div>
    </div>
  );
}