import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, TrendingUp, Clock, MapPin } from "lucide-react";

export default function CarrierCapacityExchange() {
  const capacity = [
    { carrier: 'ABC Transport', available: 5, lane: 'Chicago → Dallas', rate: 1850, updated: '5 min ago' },
    { carrier: 'XYZ Logistics', available: 3, lane: 'LA → Phoenix', rate: 950, updated: '12 min ago' },
    { carrier: 'Smith Trucking', available: 8, lane: 'Atlanta → Miami', rate: 1200, updated: '20 min ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
            Carrier Capacity Exchange
          </h1>
          <p className="text-slate-600 mt-2">Real-time capacity marketplace</p>
          <Badge className="mt-3 bg-emerald-600">🔴 LIVE Market</Badge>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Available Trucks</p>
                  <p className="text-3xl font-bold text-emerald-600">247</p>
                </div>
                <Truck className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Lanes</p>
                  <p className="text-3xl font-bold text-indigo-600">89</p>
                </div>
                <MapPin className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Rate</p>
                  <p className="text-3xl font-bold text-blue-600">$1,450</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Updates</p>
                  <p className="text-3xl font-bold text-purple-600">Real-time</p>
                </div>
                <Clock className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Live Capacity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {capacity.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div>
                    <p className="font-bold text-emerald-900">{item.carrier}</p>
                    <p className="text-sm text-emerald-700">{item.lane}</p>
                    <p className="text-xs text-emerald-600">Updated {item.updated}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">{item.available}</p>
                      <p className="text-xs text-slate-600">trucks</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">${item.rate}</p>
                      <Button size="sm" className="mt-1 bg-emerald-600">Book</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}