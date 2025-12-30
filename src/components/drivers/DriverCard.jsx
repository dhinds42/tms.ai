import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DriverPerformanceBadge from "./DriverPerformanceBadge";
import { User, Phone, MapPin, Clock, Navigation, Edit, Award, Calendar } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-300",
  assigned: "bg-blue-100 text-blue-700 border-blue-300",
  on_load: "bg-indigo-100 text-indigo-700 border-indigo-300",
  off_duty: "bg-slate-100 text-slate-700 border-slate-300",
  on_leave: "bg-amber-100 text-amber-700 border-amber-300"
};

export default function DriverCard({ driver, onEdit, onUpdateHOS }) {
  const hosPercentage = (driver.hos_remaining / 11) * 100; // Assuming 11 hours max
  const hosColor = hosPercentage > 50 ? 'bg-emerald-600' : hosPercentage > 25 ? 'bg-amber-600' : 'bg-red-600';

  return (
    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-cyan-600 to-blue-600"></div>
      <CardContent className="p-6">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <User className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {driver.full_name}
                </h3>
                <p className="text-sm text-slate-600">{driver.cdl_number}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className={`${statusColors[driver.status]} border font-medium capitalize`}>
                {driver.status.replace(/_/g, ' ')}
              </Badge>
              {driver.performance_tier && (
                <DriverPerformanceBadge 
                  tier={driver.performance_tier} 
                  score={driver.performance_score}
                  size="sm"
                />
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(driver)}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* HOS Indicator */}
        <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Hours of Service</span>
            </div>
            <span className="text-lg font-bold text-slate-900">{driver.hos_remaining || 0}h</span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${hosColor} transition-all duration-500`}
              style={{ width: `${Math.min(hosPercentage, 100)}%` }}
            />
          </div>
          {driver.hos_reset_date && (
            <p className="text-xs text-slate-500 mt-2">
              Resets: {format(new Date(driver.hos_reset_date), "MMM d, h:mm a")}
            </p>
          )}
        </div>

        {/* Contact & Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700">{driver.phone}</span>
          </div>
          {driver.email && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">{driver.email}</span>
            </div>
          )}
          {driver.current_location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">
                {driver.current_location.city}, {driver.current_location.state}
              </span>
            </div>
          )}
          {driver.equipment_assigned && (
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">Equipment: {driver.equipment_assigned}</span>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Loads</p>
            </div>
            <p className="text-lg font-bold text-emerald-600">
              {driver.total_loads || 0}
            </p>
          </div>
          <div className="text-center border-x border-slate-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-indigo-600" />
              <p className="text-xs font-semibold text-slate-500 uppercase">On-Time</p>
            </div>
            <p className="text-lg font-bold text-indigo-600">
              {driver.on_time_percentage || 0}%
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-xs font-semibold text-slate-500 uppercase">Rating</p>
            </div>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < Math.floor(driver.rating || 0)
                      ? 'bg-amber-500'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CDL Expiration */}
        {driver.cdl_expiration && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">CDL Expires:</span>
              <span className="font-medium text-slate-900">
                {format(new Date(driver.cdl_expiration), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}