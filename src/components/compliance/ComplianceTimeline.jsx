import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format, addDays, isAfter, isBefore } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ComplianceTimeline({ items, isLoading }) {
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

  const today = new Date();
  const next30Days = addDays(today, 30);
  const next60Days = addDays(today, 60);

  const expiringItems = items
    .filter(item => item.expiration_date)
    .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date))
    .slice(0, 10);

  const getTimelineSegment = (expirationDate) => {
    const expDate = new Date(expirationDate);
    if (isBefore(expDate, today)) return 'expired';
    if (isBefore(expDate, next30Days)) return '30days';
    if (isBefore(expDate, next60Days)) return '60days';
    return 'future';
  };

  const segmentConfig = {
    expired: { color: 'bg-red-600', textColor: 'text-red-900', label: 'Expired' },
    '30days': { color: 'bg-amber-600', textColor: 'text-amber-900', label: 'Next 30 Days' },
    '60days': { color: 'bg-blue-600', textColor: 'text-blue-900', label: 'Next 60 Days' },
    future: { color: 'bg-emerald-600', textColor: 'text-emerald-900', label: 'Future' }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-xl font-bold text-slate-900">Expiration Timeline</CardTitle>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Upcoming compliance expirations sorted by date
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        {expiringItems.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-600">No upcoming expirations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expiringItems.map((item) => {
              const segment = getTimelineSegment(item.expiration_date);
              const config = segmentConfig[segment];
              const daysUntil = Math.ceil((new Date(item.expiration_date) - today) / (1000 * 60 * 60 * 24));
              
              return (
                <div 
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className={`w-2 h-16 rounded-full ${config.color}`}></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.entity_name}</h4>
                        <p className="text-sm text-slate-600 capitalize">
                          {item.compliance_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {format(new Date(item.expiration_date), "MMM d, yyyy")}
                        </p>
                        <p className={`text-sm font-medium ${
                          daysUntil < 0 ? 'text-red-600' : 
                          daysUntil < 30 ? 'text-amber-600' : 
                          'text-slate-600'
                        }`}>
                          {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {segment === 'expired' && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      {segment === '30days' && (
                        <Clock className="w-4 h-4 text-amber-600" />
                      )}
                      <span className={`text-xs font-medium ${config.textColor}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}