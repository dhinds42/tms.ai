import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, List, TrendingUp, MapPin, Clock } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";

export default function ActivityPlanningWidget({ loads }) {
  const [viewMode, setViewMode] = useState('timeline'); // timeline, calendar, list

  // Get next 7 days of scheduled activities
  const today = new Date();
  const next7Days = [...Array(7)].map((_, i) => addDays(today, i));

  const getLoadsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return loads.filter(l => {
      const pickupDate = l.pickup_date ? format(new Date(l.pickup_date), 'yyyy-MM-dd') : null;
      const deliveryDate = l.delivery_date ? format(new Date(l.delivery_date), 'yyyy-MM-dd') : null;
      return pickupDate === dateStr || deliveryDate === dateStr;
    });
  };

  const upcomingPickups = loads.filter(l => 
    l.pickup_date && 
    new Date(l.pickup_date) >= today &&
    new Date(l.pickup_date) <= addDays(today, 7)
  ).length;

  const upcomingDeliveries = loads.filter(l => 
    l.delivery_date && 
    new Date(l.delivery_date) >= today &&
    new Date(l.delivery_date) <= addDays(today, 7)
  ).length;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Activity Planning (7-Day Forecast)
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              onClick={() => setViewMode('timeline')}
              className="h-8 px-2"
            >
              <Clock className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              onClick={() => setViewMode('calendar')}
              className="h-8 px-2"
            >
              <Calendar className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="h-8 px-2"
            >
              <List className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-indigo-200">
            <p className="text-xs text-slate-600 mb-1">Upcoming Pickups</p>
            <p className="text-2xl font-bold text-indigo-600">{upcomingPickups}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-xs text-slate-600 mb-1">Upcoming Deliveries</p>
            <p className="text-2xl font-bold text-purple-600">{upcomingDeliveries}</p>
          </div>
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {next7Days.map((date, idx) => {
              const dayLoads = getLoadsForDate(date);
              const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              
              return (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border ${
                    isToday 
                      ? 'bg-indigo-100 border-indigo-300' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className={`text-sm font-bold ${
                        isToday ? 'text-indigo-900' : 'text-slate-900'
                      }`}>
                        {format(date, 'EEE, MMM d')}
                      </p>
                      {isToday && (
                        <Badge className="bg-indigo-600 text-white text-xs mt-1">Today</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {dayLoads.length} {dayLoads.length === 1 ? 'load' : 'loads'}
                    </Badge>
                  </div>
                  
                  {dayLoads.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {dayLoads.slice(0, 3).map((load, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate">
                            {load.pickup_location?.city} → {load.dropoff_location?.city}
                          </span>
                        </div>
                      ))}
                      {dayLoads.length > 3 && (
                        <p className="text-xs text-slate-500 pl-5">
                          +{dayLoads.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Calendar Grid View */}
        {viewMode === 'calendar' && (
          <div className="grid grid-cols-7 gap-1">
            {next7Days.map((date, idx) => {
              const dayLoads = getLoadsForDate(date);
              const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              
              return (
                <div 
                  key={idx}
                  className={`p-2 rounded border text-center ${
                    isToday 
                      ? 'bg-indigo-100 border-indigo-300' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">
                    {format(date, 'EEE')}
                  </p>
                  <p className="text-lg font-bold text-slate-700">
                    {format(date, 'd')}
                  </p>
                  {dayLoads.length > 0 && (
                    <Badge className="bg-indigo-600 text-white text-xs mt-1">
                      {dayLoads.length}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {loads
              .filter(l => 
                (l.pickup_date && new Date(l.pickup_date) >= today && new Date(l.pickup_date) <= addDays(today, 7)) ||
                (l.delivery_date && new Date(l.delivery_date) >= today && new Date(l.delivery_date) <= addDays(today, 7))
              )
              .sort((a, b) => {
                const dateA = new Date(a.pickup_date || a.delivery_date);
                const dateB = new Date(b.pickup_date || b.delivery_date);
                return dateA - dateB;
              })
              .map((load, idx) => (
                <div key={idx} className="p-2 bg-white rounded border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      {load.load_number || load.id.slice(0, 8)}
                    </span>
                    <span className="text-slate-600">
                      {format(new Date(load.pickup_date || load.delivery_date), 'MMM d')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">
                      {load.pickup_location?.city} → {load.dropoff_location?.city}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}