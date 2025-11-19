import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";

export default function DeliveryScheduler() {
  const [appointments, setAppointments] = useState([
    { id: 1, customer: 'John Smith', address: '123 Main St, Dallas TX', time: '10:00 AM - 12:00 PM', status: 'confirmed' },
    { id: 2, customer: 'Sarah Johnson', address: '456 Oak Ave, Houston TX', time: '2:00 PM - 4:00 PM', status: 'pending' },
    { id: 3, customer: 'Mike Davis', address: '789 Elm St, Austin TX', time: '4:00 PM - 6:00 PM', status: 'confirmed' }
  ]);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Final Mile Delivery Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-900 font-semibold">Confirmed</p>
            <p className="text-2xl font-bold text-emerald-600">
              {appointments.filter(a => a.status === 'confirmed').length}
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs text-amber-900 font-semibold">Pending</p>
            <p className="text-2xl font-bold text-amber-600">
              {appointments.filter(a => a.status === 'pending').length}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-900 font-semibold">Total Today</p>
            <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
          </div>
        </div>

        <div className="space-y-2">
          {appointments.map((apt) => (
            <div key={apt.id} className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{apt.customer}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {apt.address}
                  </p>
                </div>
                <Badge className={apt.status === 'confirmed' ? 'bg-emerald-600' : 'bg-amber-600'}>
                  {apt.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {apt.time}
              </p>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}