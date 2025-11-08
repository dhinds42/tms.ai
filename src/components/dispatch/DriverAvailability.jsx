import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, MapPin } from "lucide-react";

export default function DriverAvailability({ drivers }) {
  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Available Drivers ({drivers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-4">
          {drivers.map((driver) => (
            <div key={driver.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h5 className="font-semibold text-slate-900 mb-2">{driver.full_name}</h5>
              <div className="space-y-2 text-sm">
                {driver.current_location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{driver.current_location.city}, {driver.current_location.state}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>HOS: {driver.hos_remaining || 0} hrs</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">
                  Available
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}