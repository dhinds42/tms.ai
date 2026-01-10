import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, TrendingUp, AlertTriangle, CheckCircle, Clock, MapPin } from "lucide-react";

import LiveTrackingMap from "../components/rosie/LiveTrackingMap";
import ETAPredictionCard from "../components/rosie/ETAPredictionCard";
import DelayAlerts from "../components/rosie/DelayAlerts";
import RouteOptimizations from "../components/rosie/RouteOptimizations";

export default function Rosie() {
  const { data: loads, isLoading } = useScopedEntity('Load', { limit: 100 });
  const { data: drivers, isLoading: driversLoading } = useScopedEntity('Driver', { limit: 100 });

  const activeLoads = loads.filter(l => ['dispatched', 'picked_up', 'in_transit'].includes(l.status));
  const onTimeLoads = activeLoads.filter(l => {
    if (!l.eta || !l.delivery_date) return true;
    return new Date(l.eta) <= new Date(l.delivery_date);
  });
  const atRiskLoads = activeLoads.filter(l => {
    if (!l.eta || !l.delivery_date) return false;
    return new Date(l.eta) > new Date(l.delivery_date);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-cyan-500/30">
            <Navigation className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent mb-2">
            Rosie: Real-time Visibility & ETA Bot
          </h1>
          <p className="text-slate-600 text-lg">
            AI-powered tracking, ETA predictions, and proactive delay management
          </p>
          <Badge className="mt-3 bg-cyan-600">Live Tracking</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Loads</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{activeLoads.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">On-Time</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{onTimeLoads.length}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeLoads.length > 0 ? ((onTimeLoads.length / activeLoads.length) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">At Risk</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{atRiskLoads.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg ETA Accuracy</p>
                  <p className="text-3xl font-bold text-cyan-600 mt-2">94%</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delay Alerts */}
        <DelayAlerts loads={atRiskLoads} drivers={drivers} />

        {/* Live Tracking Map */}
        <LiveTrackingMap loads={activeLoads} drivers={drivers} isLoading={isLoading || driversLoading} />

        {/* ETA Predictions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {activeLoads.slice(0, 4).map(load => (
            <ETAPredictionCard key={load.id} load={load} drivers={drivers} />
          ))}
        </div>

        {/* Route Optimizations */}
        <RouteOptimizations loads={activeLoads} />

      </div>
    </div>
  );
}