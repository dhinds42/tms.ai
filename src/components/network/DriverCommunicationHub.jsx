import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Users, Bell, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function DriverCommunicationHub() {
  const [message, setMessage] = useState("");
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const queryClient = useQueryClient();

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const sendBulkMessage = useMutation({
    mutationFn: async (data) => {
      const promises = data.driverIds.map(driverId => 
        base44.entities.Notification.create({
          user_id: driverId,
          notification_type: 'message_received',
          channel: 'sms',
          title: 'Network Update',
          message: data.message,
          priority: 'medium'
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      setMessage("");
      setSelectedDrivers([]);
    },
  });

  const activeDrivers = drivers.filter(d => d.status === 'active' || d.status === 'available');

  const handleSendMessage = () => {
    if (message && selectedDrivers.length > 0) {
      sendBulkMessage.mutate({ 
        driverIds: selectedDrivers, 
        message 
      });
    }
  };

  const toggleDriver = (driverId) => {
    setSelectedDrivers(prev => 
      prev.includes(driverId) 
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Enhanced Driver Communication</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Broadcast updates to driver network</p>
            </div>
          </div>
          <Badge className="bg-emerald-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            {activeDrivers.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          
          {/* Message Composer */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Message</label>
            <Textarea
              placeholder="Type your message to drivers..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Driver Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">Select Recipients</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDrivers(activeDrivers.map(d => d.id))}
              >
                <Users className="w-3 h-3 mr-1" />
                Select All ({activeDrivers.length})
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg">
              {activeDrivers.map(driver => (
                <label
                  key={driver.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    selectedDrivers.includes(driver.id)
                      ? 'bg-indigo-50 border-2 border-indigo-600'
                      : 'bg-white border-2 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDrivers.includes(driver.id)}
                    onChange={() => toggleDriver(driver.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium truncate">
                    {driver.first_name} {driver.last_name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Quick Templates</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage("Network optimization route update: New preferred lanes available.")}
              >
                Route Update
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage("Priority load available in your area. Check load board for details.")}
              >
                Priority Load
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage("Weather alert: Plan route accordingly. Safety first!")}
              >
                Weather Alert
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage("Fuel price update: Preferred stops with best rates updated.")}
              >
                Fuel Update
              </Button>
            </div>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!message || selectedDrivers.length === 0 || sendBulkMessage.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-6"
          >
            <Send className="w-4 h-4 mr-2" />
            Send to {selectedDrivers.length} Driver{selectedDrivers.length !== 1 ? 's' : ''}
          </Button>

        </div>
      </CardContent>
    </Card>
  );
}