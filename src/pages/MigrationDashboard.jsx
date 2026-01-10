import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/design-system/PageHeader";
import { Database, Upload, CheckCircle2, XCircle, Clock, Plus } from "lucide-react";

export default function MigrationDashboard() {
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['migrationJobs'],
    queryFn: () => base44.entities.MigrationJob.list('-created_date', 50),
    initialData: [],
  });

  const statusConfig = {
    completed: { icon: CheckCircle2, color: "bg-emerald-500", label: "Completed" },
    processing: { icon: Clock, color: "bg-blue-500", label: "Processing" },
    failed: { icon: XCircle, color: "bg-red-500", label: "Failed" },
    pending: { icon: Clock, color: "bg-slate-500", label: "Pending" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Data Migration Dashboard"
        subtitle="Import data from legacy TMS systems"
        icon={Database}
        primaryAction={{
          label: 'New Migration',
          icon: Plus,
          onClick: () => {}
        }}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">{jobs.length}</div>
              <p className="text-sm text-slate-600 mt-1">Total Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600">
                {jobs.filter(j => j.status === 'completed').length}
              </div>
              <p className="text-sm text-slate-600 mt-1">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">
                {jobs.filter(j => j.status === 'processing').length}
              </div>
              <p className="text-sm text-slate-600 mt-1">Processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">
                {jobs.reduce((sum, j) => sum + (j.processed_records || 0), 0).toLocaleString()}
              </div>
              <p className="text-sm text-slate-600 mt-1">Records Migrated</p>
            </CardContent>
          </Card>
        </div>

        {/* Migration Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Migration Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.map(job => {
              const StatusIcon = statusConfig[job.status]?.icon || Clock;
              const progress = job.total_records > 0 
                ? Math.round((job.processed_records / job.total_records) * 100)
                : 0;

              return (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{job.job_name}</h3>
                        <Badge className={`${statusConfig[job.status]?.color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[job.status]?.label}
                        </Badge>
                        {job.dry_run && (
                          <Badge variant="outline">Dry Run</Badge>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-slate-500">Source:</span>
                          <span className="ml-2 font-semibold">{job.source_system}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Entity:</span>
                          <span className="ml-2 font-semibold">{job.entity_type}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Total Records:</span>
                          <span className="ml-2">{job.total_records?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Processed:</span>
                          <span className="ml-2">{job.processed_records?.toLocaleString()}</span>
                        </div>
                      </div>
                      {job.status === 'processing' && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-600">Progress</span>
                            <span className="text-sm font-semibold">{progress}%</span>
                          </div>
                          <Progress value={progress} />
                        </div>
                      )}
                      {job.failed_records > 0 && (
                        <p className="text-sm text-red-600 mt-2">
                          {job.failed_records} records failed validation
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              );
            })}

            {jobs.length === 0 && (
              <div className="py-12 text-center">
                <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">No migration jobs yet</p>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Start Migration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}