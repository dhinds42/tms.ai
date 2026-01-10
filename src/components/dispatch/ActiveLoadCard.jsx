import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, ArrowRight, AlertTriangle, Phone, MessageSquare, MapPin, Bell, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ActiveLoadCard({ load, driver, getStatusColor }) {
  return (
    <div className="p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 text-sm">{load.load_number || load.id.slice(0, 8)}</h3>
          <Badge className={`text-xs ${getStatusColor(load.status)}`}>{load.status?.replace('_', ' ')}</Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Phone className="w-4 h-4 mr-2" /> Call Driver</DropdownMenuItem>
            <DropdownMenuItem><MessageSquare className="w-4 h-4 mr-2" /> Send Message</DropdownMenuItem>
            <DropdownMenuItem><MapPin className="w-4 h-4 mr-2" /> Track Location</DropdownMenuItem>
            <DropdownMenuItem><Bell className="w-4 h-4 mr-2" /> Send Update</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
        <span className="font-medium">{load.pickup_location?.city}, {load.pickup_location?.state}</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="font-medium">{load.dropoff_location?.city}, {load.dropoff_location?.state}</span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-500">
          {driver && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {driver.first_name} {driver.last_name?.charAt(0)}.
            </span>
          )}
          {load.eta && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ETA: {new Date(load.eta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          )}
        </div>
        {load.customer_rate && (
          <span className="font-semibold text-emerald-600">${load.customer_rate.toLocaleString()}</span>
        )}
      </div>

      {load.delay_minutes > 0 && (
        <div className="mt-2 py-1 px-2 bg-amber-50 border border-amber-200 rounded text-xs flex items-center gap-1 text-amber-700">
          <AlertTriangle className="w-3 h-3" />
          Delayed {load.delay_minutes}min
        </div>
      )}
    </div>
  );
}