import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, CheckCircle } from "lucide-react";

export default function CustomerNotifications() {
  const notifications = [
    { id: 1, type: 'pickup', customer: 'ABC Corp', status: 'sent', time: '2 hours ago' },
    { id: 2, type: 'in_transit', customer: 'XYZ Inc', status: 'delivered', time: '4 hours ago' },
    { id: 3, type: 'delivery', customer: 'Smith LLC', status: 'pending', time: '1 hour ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mb-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
            Customer Notification Engine
          </h1>
          <p className="text-slate-600 mt-2">Automated proactive updates (pickup, transit, delivery)</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Sent Today</p>
                  <p className="text-3xl font-bold text-green-600">247</p>
                </div>
                <Bell className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Email Rate</p>
                  <p className="text-3xl font-bold text-blue-600">98%</p>
                </div>
                <Mail className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">SMS Rate</p>
                  <p className="text-3xl font-bold text-indigo-600">95%</p>
                </div>
                <MessageSquare className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Satisfaction</p>
                  <p className="text-3xl font-bold text-emerald-600">4.8/5</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-semibold capitalize">{notif.type.replace('_', ' ')} Update</p>
                    <p className="text-sm text-slate-600">{notif.customer} • {notif.time}</p>
                  </div>
                  <Badge className={
                    notif.status === 'sent' ? 'bg-green-600' :
                    notif.status === 'delivered' ? 'bg-emerald-600' :
                    'bg-amber-600'
                  }>
                    {notif.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}