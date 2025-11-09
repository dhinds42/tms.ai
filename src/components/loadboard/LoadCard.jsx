import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, DollarSign, TrendingUp, Send } from "lucide-react";
import DirectionForwardingModal from "./DirectionForwardingModal";

export default function LoadCard({ load, onSelect, isSelected, operatingMode }) {
  const [showForwardModal, setShowForwardModal] = useState(false);

  // Mock driver/carrier data - in production, fetch from database
  const driver = load.driver_id ? { id: load.driver_id, full_name: 'Mike Johnson', phone: '(555) 123-4567', email: 'mike.j@company.com' } : null;
  const carrier = load.carrier_id ? { id: load.carrier_id, company_name: 'ABC Trucking', phone: '(555) 987-6543', email: 'dispatch@abctrucking.com' } : null;

  const statusColors = {
    available: 'bg-slate-100 text-slate-800',
    tendered: 'bg-blue-100 text-blue-800',
    assigned: 'bg-purple-100 text-purple-800',
    dispatched: 'bg-indigo-100 text-indigo-800',
    picked_up: 'bg-cyan-100 text-cyan-800',
    in_transit: 'bg-blue-100 text-blue-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    invoiced: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const hasRecipient = (operatingMode === 'carrier' && driver) || (operatingMode === 'broker' && carrier);

  return (
    <>
      <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white group">
        {isSelected && (
          <div className="absolute top-3 left-3 z-10">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
              </h3>
              <Badge className={`mt-2 ${statusColors[load.status] || 'bg-slate-100 text-slate-800'}`}>
                {load.status?.replace('_', ' ')}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">
                ${load.customer_rate?.toLocaleString() || '0'}
              </p>
              {load.carrier_pay && operatingMode === 'broker' && (
                <p className="text-sm text-slate-600">
                  Margin: ${(load.customer_rate - load.carrier_pay).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Pickup</p>
                <p className="text-sm text-slate-600">
                  {load.pickup_location?.city}, {load.pickup_location?.state}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Delivery</p>
                <p className="text-sm text-slate-600">
                  {load.dropoff_location?.city}, {load.dropoff_location?.state}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>{load.equipment_type?.replace('_', ' ')}</span>
              <span>{load.distance_miles || 'N/A'} mi</span>
            </div>
            
            {/* Forward Directions Button */}
            {hasRecipient && ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(load.status) && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowForwardModal(true);
                }}
                size="sm"
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Navigation className="w-3 h-3 mr-1" />
                Forward
              </Button>
            )}
          </div>
        </CardContent>

        <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500 rounded-lg transition-colors pointer-events-none" />
      </Card>

      {/* Direction Forwarding Modal */}
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