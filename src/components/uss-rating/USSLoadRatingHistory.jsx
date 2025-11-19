import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, DollarSign } from "lucide-react";

export default function USSLoadRatingHistory() {
  const { data: ratings } = useQuery({
    queryKey: ['uss_ratings'],
    queryFn: () => base44.entities.USSLoadRating.list('-calculated_at', 50),
    initialData: [],
  });

  const totalRevenue = ratings.reduce((sum, r) => sum + (r.total_charge || 0), 0);
  const avgCharge = ratings.length > 0 ? totalRevenue / ratings.length : 0;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          U.S. Steel Rating History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-900 font-semibold">Total Quotes</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{ratings.length}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-sm text-emerald-900 font-semibold">Total Revenue</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              ${totalRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded border border-purple-200">
            <p className="text-sm text-purple-900 font-semibold">Avg Charge</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              ${avgCharge.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Recent Ratings</h4>
          {ratings.slice(0, 10).map((rating) => (
            <div key={rating.id} className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Load ID: {rating.load_id}</p>
                  <p className="text-xs text-slate-600">
                    {rating.rate_source} | {rating.minimum_weight_bracket?.toLocaleString()} lbs min
                  </p>
                  <p className="text-xs text-slate-600">
                    Base: ${rating.base_linehaul} + FSC: ${rating.fuel_surcharge} 
                    {rating.detention_charge > 0 && ` + Det: $${rating.detention_charge}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">${rating.total_charge}</p>
                  <Badge className="bg-blue-600 mt-1">Rev {rating.rate_schedule_revision}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {ratings.length === 0 && (
          <div className="p-8 text-center">
            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No ratings calculated yet</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}