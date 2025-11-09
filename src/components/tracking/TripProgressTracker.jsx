import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, Clock, Navigation, AlertCircle, CheckCircle } from "lucide-react";

export default function TripProgressTracker({ loads, eldData, drivers, operatingMode }) {
  // Calculate trip progress based on GPS and appointments
  const calculateProgress = (load, eld) => {
    if (!load.pickup_date || !load.delivery_date) return 0;
    
    const start = new Date(load.pickup_date);
    const end = new Date(load.delivery_date);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.floor((elapsed / total) * 100);
  };

  // Determine status based on progress and ETA
  const getStatus = (load, progress) => {
    if (load.status === 'delivered') return 'completed';
    
    if (load.eta && load.delivery_date) {
      const eta = new Date(load.eta);
      const scheduled = new Date(load.delivery_date);
      const hoursAhead = (scheduled - eta) / (1000 * 60 * 60);
      
      if (hoursAhead < 0) return 'delayed';
      if (hoursAhead < 2) return 'at_risk';
    }
    
    return 'on_time';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-purple-500';
      case 'on_time': return 'bg-emerald-500';
      case 'at_risk': return 'bg-amber-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <Badge className="bg-purple-100 text-purple-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'on_time': return <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" />On Time</Badge>;
      case 'at_risk': return <Badge className="bg-amber-100 text-amber-800"><AlertCircle className="w-3 h-3 mr-1" />At Risk</Badge>;
      case 'delayed': return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Delayed</Badge>;
      default: return <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>;
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          Trip Progress Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-sm text-indigo-800">
            <strong>🎯 Color-Coded Progress:</strong> Monitor trip progress with real-time GPS tracking and color-coded
            status indicators based on appointment times and ETA calculations.
          </p>
        </div>

        {/* Progress Cards */}
        <div className="space-y-4">
          {loads.map((load, idx) => {
            const eld = eldData[idx];
            const driver = drivers?.find(d => d.id === load.driver_id);
            const progress = calculateProgress(load, eld);
            const status = getStatus(load, progress);
            const statusColor = getStatusColor(status);

            return (
              <div key={load.id} className="p-6 rounded-lg border-2 border-slate-200 hover:shadow-lg transition-all">
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
                    </h4>
                    {driver && (
                      <p className="text-sm text-slate-600 mt-1">{driver.full_name}</p>
                    )}
                  </div>
                  {getStatusBadge(status)}
                </div>

                {/* Route */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 mt-1" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Pickup</p>
                      <p className="text-sm text-slate-900">
                        {load.pickup_location?.city}, {load.pickup_location?.state}
                      </p>
                      {load.pickup_date && (
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(load.pickup_date).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Delivery</p>
                      <p className="text-sm text-slate-900">
                        {load.dropoff_location?.city}, {load.dropoff_location?.state}
                      </p>
                      {load.delivery_date && (
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(load.delivery_date).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Trip Progress</span>
                    <span className="text-slate-600">{progress}%</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColor} transition-all duration-500 relative`}
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-0 w-1 h-full bg-slate-900"></div>
                    </div>
                  </div>
                </div>

                {/* ELD Data */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Distance to Stop</p>
                    <p className="text-lg font-bold text-slate-900">{eld?.next_stop_distance || 0} mi</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Current Speed</p>
                    <p className="text-lg font-bold text-slate-900">{eld?.speed || 0} mph</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">HOS Remaining</p>
                    <p className="text-lg font-bold text-slate-900">{eld?.hos_remaining || 0}h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">ETA</p>
                    <p className="text-lg font-bold text-slate-900">
                      {load.eta ? new Date(load.eta).toLocaleTimeString() : 'N/A'}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {loads.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No active trips to monitor</p>
          </div>
        )}

        {/* Legend */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-3">Status Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span>On Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span>At Risk (&lt;2h buffer)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Delayed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}