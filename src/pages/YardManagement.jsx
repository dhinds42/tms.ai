import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, CheckCircle, Clock } from "lucide-react";

export default function YardManagement() {
  const { data: yardSlots, isLoading } = useQuery({
    queryKey: ['yardSlots'],
    queryFn: () => base44.entities.YardSlot.list('-created_date', 100),
    initialData: [],
  });

  const availableSlots = yardSlots.filter(s => s.status === 'available').length;
  const occupiedSlots = yardSlots.filter(s => s.status === 'occupied').length;
  const reservedSlots = yardSlots.filter(s => s.status === 'reserved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
            Yard Management
          </h1>
          <p className="text-slate-600 mt-2">Yard and dock door management system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Available</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{availableSlots}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Occupied</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{occupiedSlots}</p>
                </div>
                <Truck className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Reserved</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{reservedSlots}</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-slate-200">
            <CardTitle>Yard Slots</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {yardSlots.map((slot) => (
                <div key={slot.id} className={`p-4 rounded-lg border-2 ${
                  slot.status === 'available' ? 'bg-emerald-50 border-emerald-200' :
                  slot.status === 'occupied' ? 'bg-blue-50 border-blue-200' :
                  'bg-amber-50 border-amber-200'
                }`}>
                  <p className="font-bold text-slate-900">{slot.slot_code}</p>
                  <Badge className="mt-2 text-xs">{slot.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}