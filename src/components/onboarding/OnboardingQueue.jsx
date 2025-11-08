import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { format } from "date-fns";

export default function OnboardingQueue({ carriers, isLoading, onApprove, onReject, onViewDetails }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-slate-600">Loading carriers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl font-bold text-slate-900">
          Onboarding Queue ({carriers.length})
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Carriers awaiting approval
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        
        {carriers.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Queue is Clear!</h3>
            <p className="text-slate-600">No carriers pending approval</p>
          </div>
        ) : (
          <div className="space-y-4">
            {carriers.map((carrier) => (
              <div key={carrier.id} className="p-5 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{carrier.company_name}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-slate-600">MC: {carrier.mc_number}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-sm text-slate-600">DOT: {carrier.dot_number}</span>
                    </div>
                    {carrier.created_date && (
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          Submitted {format(new Date(carrier.created_date), "MMM d, h:mm a")}
                        </span>
                      </div>
                    )}
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border border-amber-300">
                    Pending Review
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Equipment:</span>
                  <div className="flex flex-wrap gap-2">
                    {carrier.equipment_types?.slice(0, 3).map((eq, idx) => (
                      <Badge key={idx} variant="outline" className="bg-white text-slate-700 capitalize text-xs">
                        {eq.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                    {carrier.equipment_types?.length > 3 && (
                      <Badge variant="outline" className="bg-white text-slate-700 text-xs">
                        +{carrier.equipment_types.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => onViewDetails(carrier)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    onClick={() => onApprove(carrier.id)}
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => onReject(carrier.id)}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}