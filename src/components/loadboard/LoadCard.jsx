import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, ArrowRight, Truck, Calendar, Clock } from "lucide-react";
import DirectionForwardingModal from "./DirectionForwardingModal";
import { format } from "date-fns";

export default function LoadCard({ load, onSelect, isSelected, operatingMode }) {
  const [showForwardModal, setShowForwardModal] = useState(false);

  const driver = load.driver_id ? { id: load.driver_id, full_name: 'Mike Johnson', phone: '(555) 123-4567', email: 'mike.j@company.com' } : null;
  const carrier = load.carrier_id ? { id: load.carrier_id, company_name: 'ABC Trucking', phone: '(555) 987-6543', email: 'dispatch@abctrucking.com' } : null;

  const statusConfig = {
    available: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
    tendered: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    assigned: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
    dispatched: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    picked_up: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
    in_transit: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500 animate-pulse' },
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    invoiced: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' }
  };

  const config = statusConfig[load.status] || statusConfig.available;
  const hasRecipient = (operatingMode === 'carrier' && driver) || (operatingMode === 'broker' && carrier);
  const margin = load.customer_rate && load.carrier_pay ? load.customer_rate - load.carrier_pay : null;

  return (
    <>
      <Card 
        className={`relative overflow-hidden transition-all duration-200 border hover:shadow-md cursor-pointer ${
          isSelected ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-white hover:border-indigo-300'
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-3">
          {/* Top Row - Load ID, Status, Rate */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isSelected && (
                <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              <span className="font-bold text-slate-900 text-sm">
                {load.load_number || load.id.slice(0, 8).toUpperCase()}
              </span>
              <Badge className={`text-xs px-1.5 py-0 h-5 ${config.bg} ${config.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${config.dot}`}></span>
                {load.status?.replace('_', ' ')}
              </Badge>
            </div>
            <div className="text-right">
              <span className="font-bold text-emerald-600 text-sm">
                ${load.customer_rate?.toLocaleString() || '0'}
              </span>
              {margin && operatingMode === 'broker' && (
                <span className="text-xs text-muted ml-1.5">
                  (+${margin.toLocaleString()})
                </span>
              )}
            </div>
          </div>

          {/* Route Row */}
          <div className="flex items-center gap-2 mb-2 py-2 px-2 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
              <span className="text-xs font-medium text-slate-700 truncate">
                {load.pickup_location?.city}, {load.pickup_location?.state}
              </span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="text-xs font-medium text-slate-700 truncate">
                {load.dropoff_location?.city}, {load.dropoff_location?.state}
              </span>
            </div>
          </div>

          {/* Bottom Row - Details */}
          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3" />
                {load.equipment_type?.replace('_', ' ') || 'N/A'}
              </span>
              <span>{load.distance_miles_planned || load.distance_miles || '—'} mi</span>
              {load.pickup_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(load.pickup_date), 'MMM d')}
                </span>
              )}
            </div>
            
            {hasRecipient && ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(load.status) && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowForwardModal(true);
                }}
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                <Navigation className="w-3 h-3 mr-1" />
                Forward
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showForwardModal && (
        <DirectionForwardingModal
          load={load}
          driver={driver}
          carrier={carrier}
          operatingMode={operatingMode}
          onClose={() => setShowForwardModal(false)}
        />
      )}
    </>
  );
}