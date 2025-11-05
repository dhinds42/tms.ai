import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Truck, DollarSign, Package, Edit, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  available: "bg-slate-100 text-slate-700 border-slate-300",
  tendered: "bg-blue-100 text-blue-700 border-blue-300",
  assigned: "bg-purple-100 text-purple-700 border-purple-300",
  dispatched: "bg-indigo-100 text-indigo-700 border-indigo-300",
  picked_up: "bg-cyan-100 text-cyan-700 border-cyan-300",
  in_transit: "bg-blue-100 text-blue-700 border-blue-300",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-300",
  invoiced: "bg-green-100 text-green-700 border-green-300",
  cancelled: "bg-red-100 text-red-700 border-red-300"
};

const priorityColors = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700"
};

export default function LoadCard({ load, onEdit, onUpdateStatus, mode }) {
  return (
    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
      <CardContent className="p-6">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-slate-900">
                {load.load_number || `Load #${load.id.slice(0, 8)}`}
              </h3>
              <Badge className={`${priorityColors[load.priority || 'medium']} border font-medium capitalize`}>
                {load.priority || 'medium'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`${statusColors[load.status]} border font-medium capitalize`}>
                {load.status.replace(/_/g, ' ')}
              </Badge>
              {load.equipment_type && (
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 capitalize">
                  <Truck className="w-3 h-3 mr-1" />
                  {load.equipment_type.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                <Edit className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(load)}>
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus('assigned')}>
                Mark as Assigned
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus('in_transit')}>
                Mark as In Transit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus('delivered')}>
                Mark as Delivered
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Route */}
        <div className="space-y-3 mb-4 p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pickup</p>
              <p className="font-semibold text-slate-900">
                {load.pickup_location?.city}, {load.pickup_location?.state}
              </p>
              {load.pickup_date && (
                <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(load.pickup_date), "MMM d, yyyy h:mm a")}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <MapPin className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dropoff</p>
              <p className="font-semibold text-slate-900">
                {load.dropoff_location?.city}, {load.dropoff_location?.state}
              </p>
              {load.delivery_date && (
                <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(load.delivery_date), "MMM d, yyyy h:mm a")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {load.commodity && (
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Commodity</p>
                <p className="font-medium text-slate-900 text-sm">{load.commodity}</p>
              </div>
            </div>
          )}
          {load.distance_miles && (
            <div>
              <p className="text-xs text-slate-500">Distance</p>
              <p className="font-medium text-slate-900 text-sm">{load.distance_miles} mi</p>
            </div>
          )}
          {load.weight && (
            <div>
              <p className="text-xs text-slate-500">Weight</p>
              <p className="font-medium text-slate-900 text-sm">{load.weight.toLocaleString()} lbs</p>
            </div>
          )}
          {load.rate_per_mile && (
            <div>
              <p className="text-xs text-slate-500">Rate/Mile</p>
              <p className="font-medium text-slate-900 text-sm">${load.rate_per_mile.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Financial Info */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-slate-500">Customer Rate</p>
                <p className="text-lg font-bold text-emerald-600 flex items-center">
                  <DollarSign className="w-4 h-4" />
                  {load.customer_rate ? load.customer_rate.toLocaleString() : '-'}
                </p>
              </div>
              {mode === 'broker' && load.carrier_pay && (
                <div>
                  <p className="text-xs text-slate-500">Carrier Pay</p>
                  <p className="text-lg font-bold text-slate-700 flex items-center">
                    <DollarSign className="w-4 h-4" />
                    {load.carrier_pay.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            {mode === 'broker' && load.margin && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Margin</p>
                <p className="text-lg font-bold text-indigo-600">
                  ${load.margin.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {load.special_instructions && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-900 mb-1">Special Instructions</p>
            <p className="text-sm text-amber-800">{load.special_instructions}</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}