import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, MapPin, CheckCircle, Camera } from "lucide-react";

export default function DriverMobileInterface() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 50),
    initialData: [],
  });

  const activeLoads = loads.filter(l => l.status === 'in_transit' || l.status === 'dispatched').slice(0, 3);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-cyan-600" />
          Mobile Driver App Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
          <h4 className="font-semibold text-cyan-900 mb-2">📱 Available Features</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>✓ Real-time load updates</li>
            <li>✓ GPS navigation integration</li>
            <li>✓ POD capture & signature</li>
            <li>✓ ELD integration</li>
            <li>✓ Pre-trip & post-trip inspections</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Active Loads</h4>
          {activeLoads.map((load) => (
            <div key={load.id} className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">#{load.load_number}</p>
                <Badge className="bg-cyan-600">Active</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <Button size="sm" variant="outline">
                  <MapPin className="w-3 h-3 mr-1" />
                  Navigate
                </Button>
                <Button size="sm" variant="outline">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Update
                </Button>
                <Button size="sm" variant="outline">
                  <Camera className="w-3 h-3 mr-1" />
                  POD
                </Button>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}