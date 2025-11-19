import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function RateScheduleManager() {
  const queryClient = useQueryClient();

  const { data: schedules } = useQuery({
    queryKey: ['uss-rate-schedules'],
    queryFn: () => base44.entities.USSRateSchedule.list('-revision_number', 20),
    initialData: [],
  });

  const activateMutation = useMutation({
    mutationFn: async (scheduleId) => {
      // Deactivate all other schedules
      await base44.entities.USSRateSchedule.update(
        { status: 'active' },
        { status: 'inactive' }
      );
      // Activate selected schedule
      return base44.entities.USSRateSchedule.update(scheduleId, {
        status: 'active',
        activated_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uss-rate-schedules'] });
    }
  });

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-slate-500',
      'active': 'bg-emerald-600',
      'inactive': 'bg-amber-600',
      'superseded': 'bg-red-600'
    };
    return colors[status] || 'bg-slate-500';
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Rate Schedule Versions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {schedules.map((schedule) => (
          <div key={schedule.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Revision {schedule.revision_number}</p>
                  <p className="text-xs text-slate-600">
                    Effective: {schedule.effective_date ? format(new Date(schedule.effective_date), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(schedule.status)}>
                {schedule.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-500" />
                <span className="text-slate-600">{schedule.total_lanes_imported || 0} lanes</span>
              </div>
              {schedule.activated_at && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-600">
                    Activated {format(new Date(schedule.activated_at), 'MMM d')}
                  </span>
                </div>
              )}
            </div>

            {schedule.status === 'draft' && (
              <Button
                onClick={() => activateMutation.mutate(schedule.id)}
                size="sm"
                className="w-full bg-emerald-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate This Version
              </Button>
            )}
          </div>
        ))}

      </CardContent>
    </Card>
  );
}