import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Navigation,
  ArrowRight,
  Phone
} from "lucide-react";
import { format } from "date-fns";

import TripCommentsModal from "./TripCommentsModal";

export default function DriverTimeline({ driver, loads, selectedDate, lastUpdate }) {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const sortedLoads = [...loads].sort((a, b) => {
    const aTime = a.pickup_date ? new Date(a.pickup_date).getTime() : 0;
    const bTime = b.pickup_date ? new Date(b.pickup_date).getTime() : 0;
    return aTime - bTime;
  });

  const getTripStatusColor = (load) => {
    if (load.status === 'delivered') return 'bg-purple-500';
    if (load.status === 'cancelled') return 'bg-slate-300';
    
    if (load.eta && load.delivery_date) {
      const eta = new Date(load.eta);
      const scheduled = new Date(load.delivery_date);
      if (eta > scheduled) return 'bg-red-500';
    }

    const now = new Date();
    if (load.pickup_date) {
      const pickupTime = new Date(load.pickup_date);
      const hoursUntilPickup = (pickupTime - now) / (1000 * 60 * 60);
      if (hoursUntilPickup < 0 && load.status === 'dispatched') {
        return 'bg-amber-500';
      }
    }

    if (load.status === 'in_transit' || load.status === 'picked_up') {
      return 'bg-blue-500';
    }

    return 'bg-emerald-500';
  };

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

  const driverName = driver.first_name && driver.last_name 
    ? `${driver.first_name} ${driver.last_name}` 
    : driver.full_name || 'Unknown Driver';

  const driverInitial = driverName.charAt(0).toUpperCase();

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        
        {/* Compact Driver Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {driverInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm">{driverName}</h3>
                <Badge className={`text-xs px-1.5 py-0 h-5 ${
                  driver.status === 'on_load' ? 'bg-blue-100 text-blue-700' :
                  driver.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {driver.status?.replace('_', ' ') || 'unknown'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                {driver.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {driver.phone}
                  </span>
                )}
                {driver.hos_remaining && (
                  <span className="text-amber-600 font-medium">{driver.hos_remaining}h HOS</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-600">{loads.length}</p>
            <p className="text-xs text-slate-500">trip{loads.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Compact Timeline Bar */}
        <div className="relative mb-3">
          <div className="flex justify-between mb-1 text-xs text-slate-400">
            <span>6AM</span>
            <span>12PM</span>
            <span>6PM</span>
          </div>
          <div className="relative h-1.5 bg-slate-100 rounded-full">
            {/* Load blocks on timeline */}
            {sortedLoads.map((load, idx) => {
              const start = load.pickup_date ? new Date(load.pickup_date) : null;
              const end = load.delivery_date ? new Date(load.delivery_date) : null;
              if (!start) return null;
              
              const startHour = start.getHours() + start.getMinutes() / 60;
              const endHour = end ? end.getHours() + end.getMinutes() / 60 : startHour + 2;
              const leftPercent = Math.max(0, ((startHour - 6) / 12) * 100);
              const widthPercent = Math.min(100 - leftPercent, ((endHour - startHour) / 12) * 100);
              
              return (
                <div 
                  key={load.id}
                  className={`absolute top-0 h-full rounded-full ${getTripStatusColor(load)}`}
                  style={{ left: `${leftPercent}%`, width: `${Math.max(widthPercent, 3)}%` }}
                />
              );
            })}
            {/* Current time indicator */}
            <div 
              className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
              style={{
                left: `${Math.max(0, Math.min(100, ((new Date().getHours() + new Date().getMinutes() / 60 - 6) / 12) * 100))}%`
              }}
            />
          </div>
        </div>

        {/* Trip List */}
        {loads.length === 0 ? (
          <div className="text-center py-4">
            <Navigation className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No trips scheduled</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedLoads.map((load) => (
              <div 
                key={load.id} 
                className="p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                onClick={() => handleTripClick(load)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getTripStatusColor(load)}`}></div>
                    <span className="font-medium text-xs text-slate-900">
                      {load.load_number || load.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {load.pickup_date ? format(new Date(load.pickup_date), 'h:mm a') : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span className="truncate">{load.pickup_location?.city}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <MapPin className="w-3 h-3 text-blue-500" />
                  <span className="truncate">{load.dropoff_location?.city}</span>
                </div>
                {['in_transit', 'picked_up'].includes(load.status) && (
                  <div className="mt-1.5">
                    <Progress value={calculateProgress(load)} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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