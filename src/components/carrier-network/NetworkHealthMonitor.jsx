import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, TrendingUp, Users, Star, AlertCircle } from "lucide-react";

export default function NetworkHealthMonitor() {
  const carrierHealth = [
    { name: 'ABC Transport', performance: 98, loads: 145, rating: 4.9, status: 'excellent' },
    { name: 'XYZ Logistics', performance: 94, loads: 89, rating: 4.7, status: 'good' },
    { name: 'Quick Haul', performance: 76, loads: 34, rating: 3.8, status: 'watch' },
    { name: 'Express Freight', performance: 92, loads: 112, rating: 4.5, status: 'good' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-600" />
          Carrier Network Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-emerald-50 rounded-lg text-center">
            <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Active Carriers</p>
            <p className="text-2xl font-bold text-emerald-600">47</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <Star className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Avg Rating</p>
            <p className="text-2xl font-bold text-blue-600">4.6</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Network Score</p>
            <p className="text-2xl font-bold text-purple-600">92</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <AlertCircle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Need Review</p>
            <p className="text-2xl font-bold text-amber-600">3</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Top Performers</h4>
          <div className="space-y-2">
            {carrierHealth.map((carrier, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{carrier.name}</span>
                    <Badge className={
                      carrier.status === 'excellent' ? 'bg-emerald-600' :
                      carrier.status === 'good' ? 'bg-blue-600' :
                      'bg-amber-600'
                    }>
                      {carrier.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="font-bold text-slate-900">{carrier.rating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Performance</p>
                    <p className="font-bold text-indigo-600">{carrier.performance}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Total Loads</p>
                    <p className="font-bold text-slate-900">{carrier.loads}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">On-Time</p>
                    <p className="font-bold text-emerald-600">{carrier.performance}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-2">📊 Network Insights</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
            <div>• 12% increase in carrier capacity</div>
            <div>• 94% average on-time performance</div>
            <div>• 3 new carriers onboarded this month</div>
            <div>• $2.3M total network volume</div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}