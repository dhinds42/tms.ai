import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Check, Eye } from "lucide-react";

export default function NotificationCenter({ notifications }) {
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.update(notificationId, {
      read: true,
      read_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-600',
      high: 'bg-orange-600',
      medium: 'bg-blue-600',
      low: 'bg-slate-600'
    };
    return colors[priority] || 'bg-slate-600';
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="space-y-6">
      
      {unreadNotifications.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-900 mb-4">Unread ({unreadNotifications.length})</h3>
          <div className="space-y-2">
            {unreadNotifications.map(notification => (
              <Card key={notification.id} className="border-2 border-indigo-200 bg-indigo-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-900">{notification.title}</span>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700">{notification.message}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(notification.created_date).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markReadMutation.mutate(notification.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {readNotifications.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-900 mb-4">Read ({readNotifications.length})</h3>
          <div className="space-y-2">
            {readNotifications.slice(0, 10).map(notification => (
              <Card key={notification.id} className="border border-slate-200 bg-slate-50 opacity-60">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{notification.title}</p>
                      <p className="text-xs text-slate-600">{notification.message}</p>
                    </div>
                    <Eye className="w-4 h-4 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No notifications yet</p>
        </div>
      )}
    </div>
  );
}