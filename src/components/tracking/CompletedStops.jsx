import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, MapPin, Clock, User, MessageSquare, ThumbsUp } from "lucide-react";

export default function CompletedStops({ loads, drivers, operatingMode }) {
  const [selectedStop, setSelectedStop] = useState(null);
  const [approvalNote, setApprovalNote] = useState("");

  // Mock completed stops data
  const completedStops = loads
    .filter(l => ['picked_up', 'in_transit', 'delivered'].includes(l.status))
    .map(load => ({
      load_id: load.id,
      load_number: load.load_number || `LOAD-${load.id.slice(0, 8)}`,
      stop_type: load.status === 'picked_up' ? 'pickup' : load.status === 'delivered' ? 'delivery' : 'in_transit',
      location: load.status === 'picked_up' 
        ? `${load.pickup_location?.city}, ${load.pickup_location?.state}`
        : `${load.dropoff_location?.city}, ${load.dropoff_location?.state}`,
      arrival_time: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      driver_id: load.driver_id,
      notes: load.status === 'delivered' ? 'Delivered to receiving dock. Signature obtained.' : null,
      approved: Math.random() > 0.5,
      approval_by: 'john.dispatcher@company.com',
      approval_time: new Date().toISOString()
    }));

  const handleApprove = (stop) => {
    alert(`Stop approved for ${stop.load_number}\nNote: ${approvalNote || 'No additional notes'}`);
    setSelectedStop(null);
    setApprovalNote("");
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            Completed Stops & Approvals
          </CardTitle>
          <Badge className="bg-emerald-100 text-emerald-800">
            {completedStops.filter(s => s.approved).length} / {completedStops.length} Approved
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>📍 Stop Approval System:</strong> Review and approve driver arrival times at pickup and delivery locations. 
            Add optional notes for documentation and tracking purposes.
          </p>
        </div>

        {/* Stops List */}
        <div className="space-y-3">
          {completedStops.map((stop, idx) => {
            const driver = drivers?.find(d => d.id === stop.driver_id);

            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 transition-all ${
                  stop.approved
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      stop.approved ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      {stop.approved ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Clock className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{stop.load_number}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={
                          stop.stop_type === 'pickup' ? 'bg-blue-100 text-blue-800' :
                          stop.stop_type === 'delivery' ? 'bg-purple-100 text-purple-800' :
                          'bg-cyan-100 text-cyan-800'
                        }>
                          {stop.stop_type}
                        </Badge>
                        {driver && (
                          <span className="text-sm text-slate-600 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {driver.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {stop.approved ? (
                    <Badge className="bg-emerald-600 text-white">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Button
                      onClick={() => setSelectedStop(stop)}
                      size="sm"
                      className="bg-amber-600 text-white hover:bg-amber-700"
                    >
                      Review & Approve
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{stop.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">
                      Arrived: {new Date(stop.arrival_time).toLocaleString()}
                    </span>
                  </div>
                </div>

                {stop.notes && (
                  <div className="mt-3 p-3 bg-white rounded border border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Driver Notes:
                    </p>
                    <p className="text-sm text-slate-600">{stop.notes}</p>
                  </div>
                )}

                {stop.approved && (
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <p className="text-xs text-emerald-700">
                      Approved by {stop.approval_by} at {new Date(stop.approval_time).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {completedStops.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No completed stops to review</p>
          </div>
        )}

        {/* Approval Modal */}
        {selectedStop && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">Approve Stop</h3>
                <p className="text-sm text-slate-600 mt-1">{selectedStop.load_number}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Stop Details:</p>
                  <div className="text-sm space-y-1 text-slate-600">
                    <p>Location: {selectedStop.location}</p>
                    <p>Arrival: {new Date(selectedStop.arrival_time).toLocaleString()}</p>
                    <p>Type: {selectedStop.stop_type}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Approval Notes (Optional):
                  </label>
                  <Input
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    placeholder="Add any notes about this stop..."
                    className="w-full"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 flex gap-3">
                <Button
                  onClick={() => handleApprove(selectedStop)}
                  className="flex-1 bg-emerald-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Stop
                </Button>
                <Button
                  onClick={() => {
                    setSelectedStop(null);
                    setApprovalNote("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}