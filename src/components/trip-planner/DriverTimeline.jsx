import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  MessageSquare, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Navigation
} from "lucide-react";

import TripBlock from "./TripBlock";
import TripCommentsModal from "./TripCommentsModal";

export default function DriverTimeline({ driver, loads, selectedDate, lastUpdate }) {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showComments, setShowComments] = useState(false);

  // Sort loads by time
  const sortedLoads = [...loads].sort((a, b) => {
    const aTime = a.pickup_date ? new Date(a.pickup_date).getTime() : 0;
    const bTime = b.pickup_date ? new Date(b.pickup_date).getTime() : 0;
    return aTime - bTime;
  });

  // Calculate time spans between trips
  const calculateTimeSpan = (load1, load2) => {
    if (!load1.delivery_date || !load2.pickup_date) return null;
    const end = new Date(load1.delivery_date);
    const start = new Date(load2.pickup_date);
    const diffMs = start - end;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { hours: diffHours, minutes: diffMins };
  };

  // Get trip status color
  const getTripStatusColor = (load) => {
    if (load.status === 'delivered') return 'bg-purple-500';
    if (load.status === 'cancelled') return 'bg-slate-300';
    
    // Check if delayed
    if (load.eta && load.delivery_date) {
      const eta = new Date(load.eta);
      const scheduled = new Date(load.delivery_date);
      if (eta > scheduled) return 'bg-red-500'; // Delayed
    }

    // Check appointment times (updated every 15 minutes)
    const now = new Date();
    if (load.pickup_date) {
      const pickupTime = new Date(load.pickup_date);
      const hoursUntilPickup = (pickupTime - now) / (1000 * 60 * 60);
      
      if (hoursUntilPickup < 0 && load.status === 'dispatched') {
        return 'bg-amber-500'; // At risk
      }
    }

    if (load.status === 'in_transit' || load.status === 'picked_up') {
      return 'bg-blue-500'; // In transit
    }

    return 'bg-emerald-500'; // On time
  };

  // Calculate ELD/GPS progress
  const calculateProgress = (load) => {
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

  const handleTripClick = (load) => {
    setSelectedTrip(load);
    setShowComments(true);
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
      <CardContent className="p-6">
        
        {/* Driver Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {driver.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{driver.full_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={
                  driver.status === 'on_load' ? 'bg-blue-100 text-blue-800' :
                  driver.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-slate-100 text-slate-800'
                }>
                  {driver.status?.replace('_', ' ')}
                </Badge>
                {driver.hos_remaining && (
                  <Badge className="bg-amber-100 text-amber-800">
                    {driver.hos_remaining}h HOS
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Total Trips Today</p>
            <p className="text-2xl font-bold text-indigo-600">{loads.length}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          
          {/* Time markers */}
          <div className="flex justify-between mb-2 text-xs text-slate-500">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>

          {/* Timeline bar */}
          <div className="relative h-2 bg-slate-200 rounded-full mb-6">
            {/* Current time indicator */}
            <div 
              className="absolute top-0 w-1 h-full bg-red-500"
              style={{
                left: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 100}%`
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-red-500 text-white text-xs rounded whitespace-nowrap">
                Now
              </div>
            </div>
          </div>

          {/* Trip Blocks */}
          <div className="space-y-4">
            {sortedLoads.map((load, idx) => (
              <div key={load.id}>
                
                {/* Trip Block */}
                <TripBlock
                  load={load}
                  color={getTripStatusColor(load)}
                  progress={calculateProgress(load)}
                  onClick={() => handleTripClick(load)}
                  lastUpdate={lastUpdate}
                />

                {/* Time Span Between Trips */}
                {idx < sortedLoads.length - 1 && (
                  <>
                    {(() => {
                      const timeSpan = calculateTimeSpan(load, sortedLoads[idx + 1]);
                      if (timeSpan && timeSpan.hours >= 0) {
                        return (
                          <div className="flex items-center justify-center py-2">
                            <div className="px-3 py-1 bg-slate-100 border border-slate-300 rounded-full text-xs text-slate-600">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {timeSpan.hours}h {timeSpan.minutes}m break
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* No trips message */}
          {loads.length === 0 && (
            <div className="text-center py-8">
              <Navigation className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No trips scheduled</p>
            </div>
          )}

        </div>

        {/* Comments Modal */}
        {showComments && selectedTrip && (
          <TripCommentsModal
            trip={selectedTrip}
            driver={driver}
            onClose={() => {
              setShowComments(false);
              setSelectedTrip(null);
            }}
          />
        )}

      </CardContent>
    </Card>
  );
}