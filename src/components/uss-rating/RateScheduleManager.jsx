import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileSpreadsheet } from "lucide-react";

export default function RateScheduleManager({ schedules, lanes }) {
  const queryClient = useQueryClient();

  const activateMutation = useMutation({
    mutationFn: async (scheduleId) => {
      const user = await base44.auth.me();
      
      // Deactivate all other schedules
      const activeOnes = schedules.filter(s => s.status === 'active');
      for (const old of activeOnes) {
        await base44.entities.USSRateSchedule.update(old.id, { status: 'superseded' });
      }

      // Activate this one
      return base44.entities.USSRateSchedule.update(scheduleId, {
        status: 'active',
        activated_at: new Date().toISOString(),
        activated_by_user_id: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uss_schedules'] });
      alert('✅ Rate schedule activated successfully');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (scheduleId) => base44.entities.USSRateSchedule.update(scheduleId, { status: 'inactive' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uss_schedules'] });
      alert('Rate schedule deactivated');
    },
  });

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle>Rate Schedule Versions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No rate schedules imported yet</p>
              <p className="text-sm text-slate-500 mt-2">Go to "Import Excel" tab to upload your first rate schedule</p>
            </div>
          ) : (
            schedules.map(schedule => {
              const scheduleLanes = lanes.filter(l => l.rate_schedule_id === schedule.id);
              return (
                <Card key={schedule.id} className={`border-2 ${
                  schedule.status === 'active' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">Revision {schedule.revision_number}</h3>
                          <Badge className={
                            schedule.status === 'active' ? 'bg-emerald-600' :
                            schedule.status === 'draft' ? 'bg-amber-600' :
                            'bg-slate-600'
                          }>
                            {schedule.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p>📅 Effective: {schedule.effective_date}</p>
                          <p>📊 Lanes: {scheduleLanes.length}</p>
                          <p>📁 File: {schedule.source_file_name}</p>
                          <p>⏰ Uploaded: {new Date(schedule.created_date).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {schedule.status === 'draft' && (
                          <Button
                            onClick={() => activateMutation.mutate(schedule.id)}
                            disabled={activateMutation.isPending}
                            size="sm"
                            className="bg-emerald-600"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activate
                          </Button>
                        )}
                        {schedule.status === 'active' && (
                          <Button
                            onClick={() => deactivateMutation.mutate(schedule.id)}
                            disabled={deactivateMutation.isPending}
                            size="sm"
                            variant="outline"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}