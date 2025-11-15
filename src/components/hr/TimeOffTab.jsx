import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, User, Check, X } from "lucide-react";

export default function TimeOffTab() {
  const [statusFilter, setStatusFilter] = useState("pending");
  
  const queryClient = useQueryClient();

  const { data: timeOffRequests = [], isLoading } = useQuery({
    queryKey: ['timeOffRequests'],
    queryFn: () => base44.entities.TimeOffRequest.list('-requested_date', 100),
    initialData: [],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list(),
    initialData: [],
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeOffRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeOffRequests'] });
    },
  });

  const filteredRequests = timeOffRequests.filter(r => 
    statusFilter === 'all' || r.status === statusFilter
  );

  const statusCounts = {
    all: timeOffRequests.length,
    pending: timeOffRequests.filter(r => r.status === 'pending').length,
    approved: timeOffRequests.filter(r => r.status === 'approved').length,
    denied: timeOffRequests.filter(r => r.status === 'denied').length,
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-emerald-100 text-emerald-800',
      denied: 'bg-red-100 text-red-800',
      cancelled: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const handleApprove = (requestId) => {
    updateRequestMutation.mutate({
      id: requestId,
      data: { status: 'approved' }
    });
  };

  const handleDeny = (requestId) => {
    updateRequestMutation.mutate({
      id: requestId,
      data: { status: 'denied' }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Time Off Requests</h2>
              <p className="text-slate-600 mt-1">Manage employee time off and PTO</p>
            </div>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>

          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mt-4">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({statusCounts.approved})</TabsTrigger>
              <TabsTrigger value="denied">Denied ({statusCounts.denied})</TabsTrigger>
              <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No time off requests</h3>
            <p className="text-slate-600">No requests found for this status</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-lg">
                            {getEmployeeName(request.employee_id)}
                          </h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status?.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {request.request_type?.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-slate-500">Start:</span>{' '}
                        <span className="font-medium text-slate-900">
                          {new Date(request.start_date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-sm">
                        <span className="text-slate-500">End:</span>{' '}
                        <span className="font-medium text-slate-900">
                          {new Date(request.end_date).toLocaleDateString()}
                        </span>
                      </div>

                      {request.days_requested && (
                        <div className="text-sm">
                          <span className="text-slate-500">Duration:</span>{' '}
                          <span className="font-medium text-slate-900">
                            {request.days_requested} days
                          </span>
                        </div>
                      )}
                    </div>

                    {request.reason && (
                      <p className="text-sm text-slate-600 mt-3">
                        <strong>Reason:</strong> {request.reason}
                      </p>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeny(request.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Deny
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}