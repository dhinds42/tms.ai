import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText } from "lucide-react";
import { format } from "date-fns";

export default function USSLoadRatingHistory() {
  const { data: ratings } = useQuery({
    queryKey: ['uss-load-ratings'],
    queryFn: () => base44.entities.USSLoadRating.list('-calculated_at', 20),
    initialData: [],
  });

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          Rating History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        
        {ratings.map((rating) => (
          <div key={rating.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-900">Load #{rating.load_id?.slice(-6)}</span>
              </div>
              <Badge className="bg-blue-600">${rating.total_charge?.toFixed(2)}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>Linehaul: ${rating.base_linehaul?.toFixed(2)}</div>
              <div>FSC: ${rating.fuel_surcharge?.toFixed(2)}</div>
              {rating.calculated_at && (
                <div className="col-span-2 text-slate-500">
                  {format(new Date(rating.calculated_at), 'MMM d, yyyy h:mm a')}
                </div>
              )}
            </div>
          </div>
        ))}

        {ratings.length === 0 && (
          <p className="text-center text-slate-500 py-8">No rating history yet</p>
        )}

      </CardContent>
    </Card>
  );
}