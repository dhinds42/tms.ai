import React from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Package, AlertCircle } from "lucide-react";

export default function TripBlock({ load, color, progress, onClick, lastUpdate }) {
  // Check if appointment is approaching (within 2 hours)
  const isApproaching = () => {
    if (!load.pickup_date) return false;
    const pickupTime = new Date(load.pickup_date);
    const now = new Date();
    const hoursUntil = (pickupTime - now) / (1000 * 60 * 60);
    return hoursUntil > 0 && hoursUntil <= 2;
  };

  // Get appointment color (updated every 15 minutes)
  const getAppointmentColor = () => {
    if (!load.pickup_date) return 'bg-slate-100 text-slate-800';
    
    const pickupTime = new Date(load.pickup_date);
    const now = new Date();
    const hoursUntil = (pickupTime - now) / (1000 * 60 * 60);
    
    if (hoursUntil < 0) {
      // Past due
      if (load.status === 'delivered') return 'bg-purple-100 text-purple-800';
      return 'bg-red-100 text-red-800';
    } else if (hoursUntil <= 1) {
      // Within 1 hour
      return 'bg-amber-100 text-amber-800';
    } else if (hoursUntil <= 2) {
      // Within 2 hours
      return 'bg-blue-100 text-blue-800';
    }
    
    return 'bg-emerald-100 text-emerald-800'; // On schedule
  };

  return (
    <div 
      onClick={onClick}
      className="relative p-4 rounded-lg border-2 border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
      style={{ backgroundColor: `${color}10` }}
    >
      
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-2 rounded-t-lg overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Trip Content */}
      <div className="mt-2">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-slate-900">
              {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
            </h4>
            <Badge className="mt-1 text-xs capitalize">
              {load.equipment_type?.replace('_', ' ')}
            </Badge>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isApproaching() && (
              <Badge className="bg-amber-100 text-amber-800 animate-pulse">
                <AlertCircle className="w-3 h-3 mr-1" />
                Soon
              </Badge>
            )}
            <Badge className={`text-xs ${getAppointmentColor()}`}>
              {new Date(load.pickup_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Badge>
          </div>
        </div>

        {/* Route */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">Pickup</p>
              <p className="text-slate-600">
                {load.pickup_location?.city}, {load.pickup_location?.state}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">Delivery</p>
              <p className="text-slate-600">
                {load.dropoff_location?.city}, {load.dropoff_location?.state}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {load.weight || 'N/A'} lbs
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {load.distance_miles || 'N/A'} mi
            </span>
          </div>
          <Badge className={`text-xs ${color.replace('bg-', 'bg-opacity-20 border border-')} border`}>
            {progress}% Complete
          </Badge>
        </div>

        {/* ELD/GPS Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>ELD/GPS Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${color} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            >
              {/* Dark progress indicator */}
              <div className="h-full w-1 bg-slate-900 ml-auto"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500 rounded-lg transition-colors pointer-events-none" />

    </div>
  );
}