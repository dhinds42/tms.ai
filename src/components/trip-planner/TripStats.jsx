import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, CheckCircle, AlertCircle } from "lucide-react";

export default function TripStats({ stats, operatingMode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Total Trips</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalTrips}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {operatingMode === 'carrier' && (
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase">Active Drivers</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.activeDrivers}</p>
              </div>
              <Users className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">On Time</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.onTime}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Delayed</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.delayed}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}