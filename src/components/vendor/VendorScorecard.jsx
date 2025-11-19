import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Clock } from "lucide-react";

export default function VendorScorecard() {
  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const vendorMetrics = carriers.slice(0, 5).map(carrier => ({
    id: carrier.id,
    name: carrier.company_name || 'Unknown Carrier',
    onTimeRate: Math.floor(Math.random() * 30) + 70,
    qualityScore: Math.floor(Math.random() * 20) + 80,
    responsiveness: Math.floor(Math.random() * 15) + 85
  }));

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-emerald-600';
    if (score >= 80) return 'bg-blue-600';
    if (score >= 70) return 'bg-amber-600';
    return 'bg-red-600';
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Vendor Performance Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {vendorMetrics.map((vendor) => (
          <div key={vendor.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-3">{vendor.name}</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-slate-600 mb-1">On-Time</p>
                <Badge className={getScoreColor(vendor.onTimeRate)}>
                  {vendor.onTimeRate}%
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Quality</p>
                <Badge className={getScoreColor(vendor.qualityScore)}>
                  {vendor.qualityScore}%
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Response</p>
                <Badge className={getScoreColor(vendor.responsiveness)}>
                  {vendor.responsiveness}%
                </Badge>
              </div>
            </div>
          </div>
        ))}

      </CardContent>
    </Card>
  );
}