import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function ComplianceAlerts({ items, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const expiredItems = items.filter(item => item.status === 'expired');
  const expiringSoonItems = items.filter(item => item.status === 'expiring_soon');

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-900">Compliance</CardTitle>
          <Link 
            to={createPageUrl("Compliance")}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View All →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
            <p className="text-sm font-medium text-slate-900">All Clear!</p>
            <p className="text-xs text-slate-500 mt-1">No compliance issues at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expiredItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4 className="text-sm font-semibold text-red-900">Expired ({expiredItems.length})</h4>
                </div>
                <div className="space-y-2">
                  {expiredItems.slice(0, 3).map(item => (
                    <div key={item.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-red-900 truncate">
                            {item.entity_name}
                          </p>
                          <p className="text-xs text-red-700 capitalize mt-1">
                            {item.compliance_type.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <Badge className="bg-red-600 text-white text-xs shrink-0">
                          Expired
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expiringSoonItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-semibold text-amber-900">Expiring Soon ({expiringSoonItems.length})</h4>
                </div>
                <div className="space-y-2">
                  {expiringSoonItems.slice(0, 3).map(item => (
                    <div key={item.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-amber-900 truncate">
                            {item.entity_name}
                          </p>
                          <p className="text-xs text-amber-700 capitalize mt-1">
                            {item.compliance_type.replace(/_/g, ' ')} • Expires {item.expiration_date ? format(new Date(item.expiration_date), "MMM d") : '-'}
                          </p>
                        </div>
                        <Badge className="bg-amber-600 text-white text-xs shrink-0">
                          Soon
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}