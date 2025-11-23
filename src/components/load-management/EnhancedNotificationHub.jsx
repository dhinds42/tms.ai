import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle, Clock, TrendingDown, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function EnhancedNotificationHub({ loads = [], drivers = [], invoices = [] }) {
  const [dismissedNotifications, setDismissedNotifications] = useState([]);

  // Generate notifications
  const notifications = [];

  // Delayed loads
  const delayedLoads = loads.filter(l => 
    l.status === 'in_transit' && 
    l.eta && 
    new Date(l.eta) < new Date()
  );
  if (delayedLoads.length > 0) {
    notifications.push({
      id: 'delayed_loads',
      type: 'warning',
      icon: Clock,
      title: `${delayedLoads.length} Load(s) Delayed`,
      message: `ETA passed without delivery confirmation`,
      timestamp: new Date(),
      priority: 'high'
    });
  }

  // Loads missing documents
  const loadsNeedingDocs = loads.filter(l => 
    l.status === 'delivered' && 
    (!l.pod_url || !l.bol_url)
  );
  if (loadsNeedingDocs.length > 0) {
    notifications.push({
      id: 'missing_docs',
      type: 'alert',
      icon: AlertTriangle,
      title: `${loadsNeedingDocs.length} Load(s) Missing Documents`,
      message: `POD or BOL required for invoicing`,
      timestamp: new Date(),
      priority: 'medium'
    });
  }

  // Available drivers
  const availableDrivers = drivers?.filter(d => d.status === 'available') || [];
  if (availableDrivers.length > 0) {
    notifications.push({
      id: 'available_drivers',
      type: 'info',
      icon: CheckCircle,
      title: `${availableDrivers.length} Driver(s) Available`,
      message: `Ready for assignment`,
      timestamp: new Date(),
      priority: 'low'
    });
  }

  // Overdue invoices
  const overdueInvoices = invoices?.filter(i => 
    i.invoice_status === 'sent' &&
    i.invoice_due_date &&
    new Date(i.invoice_due_date) < new Date()
  ) || [];
  if (overdueInvoices.length > 0) {
    notifications.push({
      id: 'overdue_invoices',
      type: 'warning',
      icon: TrendingDown,
      title: `${overdueInvoices.length} Invoice(s) Overdue`,
      message: `Follow-up required for payment`,
      timestamp: new Date(),
      priority: 'high'
    });
  }

  const activeNotifications = notifications.filter(n => !dismissedNotifications.includes(n.id));

  const handleDismiss = (notificationId) => {
    setDismissedNotifications([...dismissedNotifications, notificationId]);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-amber-500 bg-amber-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-slate-500 bg-slate-50';
    }
  };

  const getIconColor = (type) => {
    switch(type) {
      case 'warning': return 'text-amber-600';
      case 'alert': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <CardTitle>Notification Center</CardTitle>
          </div>
          <Badge className="bg-indigo-600 text-white">
            {activeNotifications.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {activeNotifications.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">All Clear!</h3>
            <p className="text-slate-600">No active notifications at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`border-l-4 ${getPriorityColor(notification.priority)} p-4 rounded-lg relative group`}
                >
                  <button
                    onClick={() => handleDismiss(notification.id)}
                    className="absolute top-2 right-2 p-1 hover:bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>

                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${getIconColor(notification.type)} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 pr-8">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-slate-900">{notification.title}</h4>
                        <Badge className={`text-xs ${
                          notification.priority === 'high' ? 'bg-red-600 text-white' :
                          notification.priority === 'medium' ? 'bg-amber-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {notification.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{notification.message}</p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeNotifications.length > 0 && (
          <Button
            onClick={() => setDismissedNotifications(notifications.map(n => n.id))}
            variant="outline"
            className="w-full mt-4"
          >
            Dismiss All
          </Button>
        )}
      </CardContent>
    </Card>
  );
}