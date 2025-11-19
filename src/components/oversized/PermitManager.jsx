import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, Calendar } from "lucide-react";

export default function PermitManager() {
  const [permits] = useState([
    { id: 1, state: 'TX', type: 'Overweight', status: 'active', expires: '2025-12-31', permit_number: 'TX-OW-12345' },
    { id: 2, state: 'CA', type: 'Overdimensional', status: 'pending', expires: '2025-11-30', permit_number: 'CA-OD-67890' },
    { id: 3, state: 'FL', type: 'Oversize', status: 'active', expires: '2025-10-15', permit_number: 'FL-OS-45678' }
  ]);

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-emerald-600' : 
           status === 'pending' ? 'bg-amber-600' : 
           'bg-red-600';
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Permit Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {permits.map((permit) => (
          <div key={permit.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-900">{permit.state} - {permit.type}</span>
              </div>
              <Badge className={getStatusColor(permit.status)}>{permit.status}</Badge>
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <p>Permit #: {permit.permit_number}</p>
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="w-3 h-3" />
                <span>Expires: {permit.expires}</span>
              </div>
            </div>
          </div>
        ))}

        <Button className="w-full bg-purple-600">
          <FileText className="w-4 h-4 mr-2" />
          Request New Permit
        </Button>

      </CardContent>
    </Card>
  );
}