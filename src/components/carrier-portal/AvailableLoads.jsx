import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Package, Calendar, CheckCircle, Sparkles } from "lucide-react";

export default function AvailableLoads({ loads, carrierId }) {
  const [negotiatingLoad, setNegotiatingLoad] = useState(null);
  const queryClient = useQueryClient();

  const bookLoadMutation = useMutation({
    mutationFn: ({ loadId, proposedRate }) => 
      base44.entities.Load.update(loadId, { 
        carrier_id: carrierId, 
        status: 'assigned',
        carrier_pay: proposedRate || undefined
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      setNegotiatingLoad(null);
    },
  });

  const handleBookLoad = (load, proposedRate = null) => {
    bookLoadMutation.mutate({ loadId: load.id, proposedRate });
  };

  if (loads.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Loads Available</h3>
        <p className="text-slate-600">Check back later for new opportunities</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loads.map((load) => (
        <div key={load.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {load.load_number || `Load #${load.id.slice(0, 8)}`}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-blue-100 text-blue-700 capitalize">
                  {load.equipment_type?.replace(/_/g, ' ')}
                </Badge>
                {load.priority === 'urgent' && (
                  <Badge className="bg-red-100 text-red-700">URGENT</Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-600">
                ${load.customer_rate?.toLocaleString() || 'TBD'}
              </p>
              <p className="text-xs text-slate-600">Carrier Pay</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs text-slate-600">Pickup</p>
                <p className="font-medium text-slate-900">
                  {load.pickup_location?.city}, {load.pickup_location?.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-slate-600">Dropoff</p>
                <p className="font-medium text-slate-900">
                  {load.dropoff_location?.city}, {load.dropoff_location?.state}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {load.distance_miles && (
              <div className="p-2 bg-white rounded">
                <p className="text-xs text-slate-600">Distance</p>
                <p className="font-semibold text-slate-900">{load.distance_miles} mi</p>
              </div>
            )}
            {load.commodity && (
              <div className="p-2 bg-white rounded">
                <p className="text-xs text-slate-600">Commodity</p>
                <p className="font-semibold text-slate-900">{load.commodity}</p>
              </div>
            )}
            {load.pickup_date && (
              <div className="p-2 bg-white rounded">
                <Calendar className="w-3 h-3 text-blue-600 mb-1" />
                <p className="text-xs text-slate-600">Pickup</p>
                <p className="font-semibold text-slate-900 text-xs">
                  {new Date(load.pickup_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleBookLoad(load)}
              disabled={bookLoadMutation.isPending}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Book This Load
            </Button>
            <Button
              onClick={() => setNegotiatingLoad(load)}
              variant="outline"
              className="border-indigo-300 text-indigo-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Negotiate Rate
            </Button>
          </div>

        </div>
      ))}
    </div>
  );
}