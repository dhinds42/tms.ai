import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield } from "lucide-react";

export default function DoubleBrokeringDetection() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 50),
    initialData: [],
  });

  // Simulate detection of suspicious patterns
  const suspiciousLoads = loads.slice(0, 3).map(load => ({
    ...load,
    riskScore: Math.floor(Math.random() * 30) + 70,
    flags: [
      'Rate significantly lower than quoted',
      'Carrier authority check failed',
      'Multiple carrier changes'
    ].slice(0, Math.floor(Math.random() * 3) + 1)
  }));

  return (
    <Card className="border-0 shadow-xl border-l-4 border-l-red-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Double Brokering Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {suspiciousLoads.map((load) => (
          <div key={load.id} className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-red-900">Load #{load.load_number}</span>
              <Badge className="bg-red-600">Risk: {load.riskScore}%</Badge>
            </div>
            <div className="space-y-1">
              {load.flags.map((flag, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-red-700">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {suspiciousLoads.length === 0 && (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <p className="text-emerald-900 font-semibold">No suspicious activity detected</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}