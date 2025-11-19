import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, History, FileText } from "lucide-react";

export default function ContractVersionControl({ schedules, onActivateSchedule }) {
  const sortedSchedules = [...schedules].sort((a, b) => b.revision_number - a.revision_number);
  const activeSchedule = schedules.find(s => s.status === 'active');

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-600" />
          Contract Version History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-900">
            <strong>Version Control:</strong><br/>
            Track all contract revisions with complete audit trail. Only one revision can be active at a time. Historical rates preserved for reporting and dispute resolution.
          </p>
        </div>

        <div className="space-y-3">
          {sortedSchedules.map((schedule) => (
            <div 
              key={schedule.id}
              className={`p-4 rounded-lg border-2 ${
                schedule.status === 'active' 
                  ? 'bg-emerald-50 border-emerald-500'
                  : schedule.status === 'draft'
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-lg">Revision {schedule.revision_number}</h4>
                  <p className="text-sm text-slate-600">
                    Effective: {schedule.effective_date} | 
                    Last Revised: {schedule.last_revised_date}
                  </p>
                </div>
                <Badge className={
                  schedule.status === 'active' ? 'bg-emerald-600' :
                  schedule.status === 'draft' ? 'bg-blue-600' :
                  schedule.status === 'superseded' ? 'bg-slate-500' : 'bg-amber-600'
                }>
                  {schedule.status}
                </Badge>
              </div>
              
              {schedule.source_file_name && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                  <FileText className="w-4 h-4" />
                  <span>{schedule.source_file_name}</span>
                </div>
              )}

              <div className="mt-3 text-sm text-slate-700">
                {schedule.total_lanes_imported} lanes imported
                {schedule.notes && ` | ${schedule.notes}`}
              </div>

              {schedule.status === 'draft' && (
                <Button 
                  onClick={() => onActivateSchedule?.(schedule)}
                  className="mt-3 bg-emerald-600"
                  size="sm"
                >
                  Activate This Revision
                </Button>
              )}
            </div>
          ))}
        </div>

        {schedules.length === 0 && (
          <div className="p-8 text-center">
            <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No schedules imported yet</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}