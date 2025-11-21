import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

export default function NotificationManager() {
  const [notifications] = useState([
    { id: 1, type: 'load_update', label: 'Load Status Updates', channels: ['email', 'sms', 'app'], enabled: true },
    { id: 2, type: 'driver_location', label: 'Driver Location Changes', channels: ['app'], enabled: true },
    { id: 3, type: 'appointment', label: 'Appointment Reminders', channels: ['email', 'sms'], enabled: true },
    { id: 4, type: 'exception', label: 'Exception Alerts', channels: ['email', 'sms', 'app'], enabled: true },
    { id: 5, type: 'invoice', label: 'Invoice Updates', channels: ['email'], enabled: false }
  ]);

  const getChannelIcon = (channel) => {
    switch(channel) {
      case 'email': return <Mail className="w-3 h-3" />;
      case 'sms': return <MessageSquare className="w-3 h-3" />;
      case 'app': return <Smartphone className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Customer Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <Mail className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-blue-900 font-semibold">Email</p>
            <p className="text-sm text-blue-600">Active</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-center">
            <MessageSquare className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-emerald-900 font-semibold">SMS</p>
            <p className="text-sm text-emerald-600">Active</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <Smartphone className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-purple-900 font-semibold">In-App</p>
            <p className="text-sm text-purple-600">Active</p>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map(notif => (
            <div key={notif.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <p className="font-semibold text-slate-900 mb-2">{notif.label}</p>
                <div className="flex items-center gap-2">
                  {notif.channels.map(channel => (
                    <Badge key={channel} variant="outline" className="bg-white">
                      {getChannelIcon(channel)}
                      <span className="ml-1 capitalize">{channel}</span>
                    </Badge>
                  ))}
                </div>
              </div>
              <Switch checked={notif.enabled} />
            </div>
          ))}
        </div>

        <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 mt-6">
          <h4 className="font-semibold text-indigo-900 mb-2">Auto-Notification Rules</h4>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>• Pickup: 2 hours before appointment</li>
            <li>• In Transit: Every 4 hours + geofence triggers</li>
            <li>• Delivery: 2 hours before + on completion</li>
            <li>• Exceptions: Immediate notification</li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}