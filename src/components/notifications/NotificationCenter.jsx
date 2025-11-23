import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, AlertTriangle, Info, TrendingUp, Clock, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationCenter({ onClose }) {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_id: user?.email }, '-created_date', 50),
    initialData: [],
    enabled: !!user
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.update(notificationId, { read: true, read_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(unreadIds.map(id => 
        base44.entities.Notification.update(id, { read: true, read_at: new Date().toISOString() })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'load_assigned':
      case 'load_updated':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'document_required':
        return <Info className="w-5 h-5 text-amber-600" />;
      case 'compliance_expiring':
      case 'system_alert':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'payment_processed':
        return <Check className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent':
        return 'border-l-red-600 bg-red-50';
      case 'high':
        return 'border-l-orange-600 bg-orange-50';
      case 'medium':
        return 'border-l-blue-600 bg-blue-50';
      default:
        return 'border-l-slate-600 bg-slate-50';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'urgent') return n.priority === 'urgent' || n.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center md:justify-end z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:w-[480px] md:max-h-[80vh] h-[85vh] md:h-auto flex flex-col md:mr-4">
        
        {/* Header */}
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-slate-600">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className="border-b border-slate-200 p-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-indigo-600' : ''}
            >
              All ({notifications.length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
              className={filter === 'unread' ? 'bg-indigo-600' : ''}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              size="sm"
              variant={filter === 'urgent' ? 'default' : 'outline'}
              onClick={() => setFilter('urgent')}
              className={filter === 'urgent' ? 'bg-red-600' : ''}
            >
              Urgent
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => markAllReadMutation.mutate()}
              className="mt-2 text-indigo-600"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-sm text-slate-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No notifications</p>
              <p className="text-sm text-slate-500">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 rounded-lg p-4 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'shadow-md' : 'opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-semibold text-sm ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1 flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-slate-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                      </p>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsReadMutation.mutate(notification.id);
                            }}
                            className="h-7 px-2 text-indigo-600"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotificationMutation.mutate(notification.id);
                          }}
                          className="h-7 px-2 text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

// Notification Badge Hook
export function useNotificationBadge() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_id: user?.email, read: false }, '-created_date', 50),
    initialData: [],
    enabled: !!user,
    refetchInterval: 30000 // Poll every 30 seconds
  });

  return notifications.length;
}