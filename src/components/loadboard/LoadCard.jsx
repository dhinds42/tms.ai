import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MapPin, 
  Package, 
  DollarSign, 
  Calendar, 
  Truck, 
  TrendingUp,
  MoreVertical,
  Edit,
  CheckCircle,
  Sparkles,
  Navigation
} from "lucide-react";

const statusColors = {
  available: "bg-blue-100 text-blue-700 border-blue-300",
  tendered: "bg-purple-100 text-purple-700 border-purple-300",
  assigned: "bg-indigo-100 text-indigo-700 border-indigo-300",
  dispatched: "bg-cyan-100 text-cyan-700 border-cyan-300",
  picked_up: "bg-amber-100 text-amber-700 border-amber-300",
  in_transit: "bg-orange-100 text-orange-700 border-orange-300",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-300",
  invoiced: "bg-green-100 text-green-700 border-green-300",
  cancelled: "bg-red-100 text-red-700 border-red-300"
};

const priorityColors = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700"
};

export default function LoadCard({ load, onEdit, onUpdateStatus, onOptimizeRoute, onAnalyzeRate, mode, isSelected, onSelect, carriers }) {
  return (
    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${
        load.priority === 'urgent' ? 'from-red-600 to-orange-600' :
        load.priority === 'high' ? 'from-amber-600 to-yellow-600' :
        'from-indigo-600 to-purple-600'
      }`}></div>
      <CardContent className="p-6">
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {mode === 'broker' && onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="mt-1 w-4 h-4 rounded border-slate-300"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-slate-900">
                  {load.load_number || `Load #${load.id.slice(0, 8)}`}
                </h3>
                {load.priority && (
                  <Badge variant="outline" className={`${priorityColors[load.priority]} border font-medium`}>
                    {load.priority}
                  </Badge>
                )}
                {load.equipment_type && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 capitalize">
                    <Truck className="w-3 h-3 mr-1" />
                    {load.equipment_type.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className={`${statusColors[load.status]} border font-medium capitalize`}>
                {load.status.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {mode === 'broker' && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(load)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Load
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAnalyzeRate && onAnalyzeRate(load)}>
                    <Sparkles className="w-4 h-4 mr-2 text-emerald-600" />
                    AI Rate Analysis
                  </DropdownMenuItem>
                </>
              )}
              {(load.status === 'available' || load.status === 'assigned') && (
                <DropdownMenuItem onClick={() => onOptimizeRoute(load)}>
                  <Navigation className="w-4 h-4 mr-2 text-blue-600" />
                  Optimize Route
                </DropdownMenuItem>
              )}
              {mode === 'broker' ? (
                <>
                  <DropdownMenuItem onClick={() => onUpdateStatus('assigned')}>
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                    Mark Assigned
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus('delivered')}>
                    <Package className="w-4 h-4 mr-2 text-blue-600" />
                    Mark Delivered
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => onUpdateStatus('assigned')}>
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                  Book This Load
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Pickup</p>
                <p className="font-semibold text-slate-900">
                  {load.pickup_location?.city}, {load.pickup_location?.state}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span className="text-xs text-slate-600 mt-1">{load.distance_miles || '?'} mi</span>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-slate-600 text-right">Dropoff</p>
                <p className="font-semibold text-slate-900 text-right">
                  {load.dropoff_location?.city}, {load.dropoff_location?.state}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <MapPin className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
          {load.pickup_date && (
            <p className="text-sm text-slate-600 text-center mt-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              {new Date(load.pickup_date).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {load.commodity && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Commodity</p>
              <p className="font-medium text-slate-900">{load.commodity}</p>
            </div>
          )}
          {load.weight && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Weight</p>
              <p className="font-medium text-slate-900">{load.weight.toLocaleString()} lbs</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div>
            <p className="text-xs text-slate-600 mb-1">Rate</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${load.customer_rate?.toLocaleString() || 'TBD'}
            </p>
            {load.rate_per_mile && (
              <p className="text-xs text-slate-600">${load.rate_per_mile.toFixed(2)}/mi</p>
            )}
          </div>
          {mode === 'broker' && load.margin && (
            <div>
              <p className="text-xs text-slate-600 mb-1">Margin</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${load.margin.toLocaleString()}
              </p>
              {load.customer_rate && (
                <p className="text-xs text-slate-600">
                  {((load.margin / load.customer_rate) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          )}
        </div>

        {mode === 'broker' && load.carrier_id && carriers && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-900 font-semibold mb-1">Assigned Carrier</p>
            <p className="text-sm text-blue-800">
              {carriers.find(c => c.id === load.carrier_id)?.company_name || 'Unknown'}
            </p>
          </div>
        )}

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