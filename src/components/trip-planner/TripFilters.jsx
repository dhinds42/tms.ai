import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, Users } from "lucide-react";

export default function TripFilters({ drivers, selectedDriver, onDriverSelect, operatingMode }) {
  return (
    <Card className="border-0 shadow-xl bg-white sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="w-4 h-4" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Driver Filter */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Select Driver
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => onDriverSelect(null)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                !selectedDriver 
                  ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-900 font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              All Drivers ({drivers.length})
            </button>
            {drivers.map(driver => (
              <button
                key={driver.id}
                onClick={() => onDriverSelect(driver.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedDriver === driver.id
                    ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-900 font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{driver.full_name}</span>
                  <Badge className={
                    driver.status === 'on_load' ? 'bg-blue-100 text-blue-800' :
                    driver.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-slate-100 text-slate-800'
                  }>
                    {driver.status?.replace('_', ' ')}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-4 border-t border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-3">Status Legend</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span>On Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>In Transit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span>At Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Delayed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}