import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MapPin, 
  Truck, 
  Package, 
  DollarSign, 
  Star, 
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Clock,
  TrendingUp
} from "lucide-react";

export default function TemplateCard({ template, shippers, onUse, onEdit, onDelete, onToggleFavorite }) {
  const shipper = shippers?.find(s => s.id === template.shipper_id);

  return (
    <Card className="bg-white hover:shadow-2xl transition-all duration-300 border border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-slate-900">{template.template_name}</h3>
              {template.is_favorite && (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              )}
            </div>
            {template.branch && (
              <Badge variant="outline" className="text-xs">
                {template.branch}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUse(template)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Use Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(template)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleFavorite(template)}>
                  <Star className={`w-4 h-4 mr-2 ${template.is_favorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                  {template.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(template.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Route */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-emerald-700 uppercase">Pickup</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {template.pickup_location?.city}, {template.pickup_location?.state}
              </p>
              {template.typical_pickup_time && (
                <p className="text-xs text-slate-600">Typical: {template.typical_pickup_time}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
            <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-700 uppercase">Dropoff</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {template.dropoff_location?.city}, {template.dropoff_location?.state}
              </p>
              {template.typical_delivery_time && (
                <p className="text-xs text-slate-600">Typical: {template.typical_delivery_time}</p>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="flex items-center gap-1 text-slate-500 mb-1">
              <Truck className="w-3 h-3" />
              <span className="text-xs">Equipment</span>
            </div>
            <p className="font-semibold text-slate-900 capitalize">
              {template.equipment_type?.replace('_', ' ')}
            </p>
          </div>

          {template.commodity && (
            <div>
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <Package className="w-3 h-3" />
                <span className="text-xs">Commodity</span>
              </div>
              <p className="font-semibold text-slate-900 truncate">{template.commodity}</p>
            </div>
          )}

          {template.distance_miles && (
            <div>
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">Distance</span>
              </div>
              <p className="font-semibold text-slate-900">{template.distance_miles} mi</p>
            </div>
          )}

          {template.customer_rate && (
            <div>
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <DollarSign className="w-3 h-3" />
                <span className="text-xs">Rate</span>
              </div>
              <p className="font-semibold text-emerald-700">${template.customer_rate}</p>
            </div>
          )}

          {template.transit_days && (
            <div>
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs">Transit</span>
              </div>
              <p className="font-semibold text-slate-900">{template.transit_days} days</p>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1 text-slate-500 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">Used</span>
            </div>
            <p className="font-semibold text-indigo-600">{template.usage_count || 0}x</p>
          </div>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {template.is_hazmat && (
            <Badge className="bg-red-100 text-red-800 text-xs">Hazmat</Badge>
          )}
          {template.priority === 'high' && (
            <Badge className="bg-orange-100 text-orange-800 text-xs">High Priority</Badge>
          )}
          {template.priority === 'urgent' && (
            <Badge className="bg-red-100 text-red-800 text-xs">Urgent</Badge>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onUse(template)}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50"
        >
          <Copy className="w-4 h-4 mr-2" />
          Use This Template
        </Button>
      </CardContent>
    </Card>
  );
}