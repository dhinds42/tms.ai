import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Shield } from "lucide-react";

export default function PermitManager() {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Oversize Permit Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-900">
            <strong>Automated permit applications:</strong><br/>
            Multi-state routing, pilot car requirements, travel time restrictions
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs text-slate-600">Active Permits</p>
            <p className="text-2xl font-bold text-slate-900">12</p>
          </div>
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs text-amber-600">Pending</p>
            <p className="text-2xl font-bold text-amber-600">5</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-600">Approved</p>
            <p className="text-2xl font-bold text-emerald-600">7</p>
          </div>
        </div>

        <Button className="w-full bg-purple-600">
          <FileText className="w-4 h-4 mr-2" />
          Request New Permit
        </Button>

      </CardContent>
    </Card>
  );
}