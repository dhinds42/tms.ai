import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle2, Info, X, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function EnhancedNotificationHub({ loads = [], drivers = [], invoices = [] }) {
  const [filter, setFilter] = useState('all'); // all, critical, info
  const [dismissed, setDismissed] = useState([]);

  // Generate notifications
  const notifications = [];

  // Critical: Delayed loads
  loads
    .filter(l => l.status === 'in_transit' && l.eta && new Date(l.eta) < new Date())
    .forEach(l => {
      notifications.push({
        id: `delayed_${l.id}`,
        type: 'critical',
        title: 'Load Delayed',
        message: `Load ${l.load_number || l.id.slice(0, 8)} is past ETA`,
        timestamp: new Date(l.eta),
        icon: AlertTriangle,
        color: 'red'
      });
    });

  // Info: Loads needing assignment
  loads
    .filter(l => l.status === 'available' && !l.driver_id && !l.carrier_id)
    .slice(0, 5)
    .forEach(l => {
      notifications.push({
        id: `unassigned_${l.id}`,
        type: 'info',
        title: 'Load Needs Assignment',
        message: `Load ${l.load_number || l.id.slice(0, 8)} is ready for assignment`,
        timestamp: new Date(l.created_date),
        icon: Info,
        color: 'blue'
      });
    });

  // Success: Recently delivered
  loads
    .filter(l => l.status === 'delivered' && l.actual_delivery_datetime)
    .slice(0, 3)
    .forEach(l => {
      notifications.push({
        id: `delivered_${l.id}`,
        type: 'success',
        title: 'Load Delivered',
        message: `Load ${l.load_number || l.id.slice(0, 8)} successfully delivered`,
        timestamp: new Date(l.actual_delivery_datetime),
        icon: CheckCircle2,
        color: 'green'
      });
    });

  // Critical: Overdue invoices
  invoices
    .filter(i => i.invoice_status === 'sent' && i.invoice_due_date && new Date(i.invoice_due_date) < new Date())
    .forEach(i => {
      notifications.push({
        id: `overdue_${i.id}`,
        type: 'critical',
        title: 'Invoice Overdue',
        message: `Invoice ${i.invoice_number} is past due`,
        timestamp: new Date(i.invoice_due_date),
        icon: AlertTriangle,
        color: 'red'
      });
    });

  // Sort by timestamp (newest first)
  notifications.sort((a, b) => b.timestamp - a.timestamp);

  // Filter notifications
  const filteredNotifications = notifications
    .filter(n => !dismissed.includes(n.id))
    .filter(n => filter === 'all' || n.type === filter);

  const handleDismiss = (id) => {
    setDismissed([...dismissed, id]);
  };

  const criticalCount = notifications.filter(n => n.type === 'critical' && !dismissed.includes(n.id)).length;

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Notification Hub
            {criticalCount > 0 && (
              <Badge className="bg-red-600 text-white ml-2">{criticalCount} Critical</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="h-7 text-xs"
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === 'critical' ? 'default' : 'outline'}
              onClick={() => setFilter('critical')}
              className="h-7 text-xs"
            >
              Critical
            </Button>
            <Button
              size="sm"
              variant={filter === 'info' ? 'default' : 'outline'}
              onClick={() => setFilter('info')}
              className="h-7 text-xs"
            >
              Info
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`border-l-4 border-l-${notif.color}-500 bg-${notif.color}-50 p-3 rounded-lg relative group`}
              >
                <button
                  onClick={() => handleDismiss(notif.id)}
                  className="absolute top-2 right-2 p-1 hover:bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-slate-600" />
                </button>
                
                <div className="flex items-start gap-3 pr-6">
                  <Icon className={`w-5 h-5 text-${notif.color}-600 mt-0.5`} />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-900 mb-1">{notif.title}</h4>
                    <p className="text-sm text-slate-700 mb-2">{notif.message}</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}