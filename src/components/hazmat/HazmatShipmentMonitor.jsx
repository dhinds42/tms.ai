import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, Shield } from "lucide-react";

export default function HazmatShipmentMonitor() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const hazmatLoads = loads.filter(l => l.hazmat === true || l.is_hazmat === true);

  return (
    <Card className="border-0 shadow-xl border-l-4 border-l-red-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Hazmat Shipment Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {hazmatLoads.map((load) => (
          <div key={load.id} className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-900">Load #{load.load_number}</span>
              </div>
              <Badge className="bg-red-600">HAZMAT</Badge>
            </div>
            <div className="text-sm text-red-800 space-y-1">
              <p>UN Number: {load.un_number || 'N/A'}</p>
              <p>Class: {load.hazmat_class || 'Unknown'}</p>
              <p>Placard Required: {load.placard_required ? 'Yes' : 'No'}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                SDS Required
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Endorsed Driver
              </Badge>
            </div>
          </div>
        ))}

        {hazmatLoads.length === 0 && (
          <p className="text-center text-slate-500 py-8">No active hazmat shipments</p>
        )}

      </CardContent>
    </Card>
  );
}