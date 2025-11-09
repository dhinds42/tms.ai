import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity,
  Search,
  User,
  Clock,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  Download,
  Filter
} from "lucide-react";

export default function ActivityAuditLog({ drivers, loads, carriers, operatingMode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState("today");

  // Mock activity log - in production, fetch from database
  const activityLog = [
    {
      id: '1',
      type: 'load_created',
      user: 'john.dispatcher@company.com',
      description: 'Created new load LOAD-12345',
      entity: 'Load',
      entityId: 'load_1',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      details: {
        load_number: 'LOAD-12345',
        route: 'LA to Phoenix'
      }
    },
    {
      id: '2',
      type: 'driver_assigned',
      user: 'sarah.ops@company.com',
      description: 'Assigned driver Mike Johnson to LOAD-12345',
      entity: 'Load',
      entityId: 'load_1',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      details: {
        driver: 'Mike Johnson',
        load: 'LOAD-12345'
      }
    },
    {
      id: '3',
      type: 'status_updated',
      user: 'mike.driver@company.com',
      description: 'Load status changed: dispatched → picked_up',
      entity: 'Load',
      entityId: 'load_1',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      details: {
        old_status: 'dispatched',
        new_status: 'picked_up'
      }
    },
    {
      id: '4',
      type: 'comment_added',
      user: 'john.dispatcher@company.com',
      description: 'Added comment to LOAD-12345',
      entity: 'Load',
      entityId: 'load_1',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      details: {
        comment: 'Driver confirmed ETA 14:00'
      }
    },
    {
      id: '5',
      type: 'carrier_onboarded',
      user: 'admin@company.com',
      description: 'New carrier ABC Trucking approved',
      entity: 'Carrier',
      entityId: 'carrier_1',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      details: {
        carrier: 'ABC Trucking',
        mc_number: 'MC123456'
      }
    },
    {
      id: '6',
      type: 'rate_updated',
      user: 'finance@company.com',
      description: 'Updated carrier rate for LOAD-12345',
      entity: 'Load',
      entityId: 'load_1',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      details: {
        old_rate: '$1200',
        new_rate: '$1350'
      }
    },
    {
      id: '7',
      type: 'document_uploaded',
      user: 'mike.driver@company.com',
      description: 'Uploaded BOL for LOAD-12345',
      entity: 'Document',
      entityId: 'doc_1',
      timestamp: new Date(Date.now() - 15000).toISOString(),
      details: {
        document_type: 'BOL',
        file_name: 'BOL_12345.pdf'
      }
    }
  ];

  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch(type) {
      case 'load_created': return <FileText className="w-4 h-4" />;
      case 'driver_assigned': return <User className="w-4 h-4" />;
      case 'status_updated': return <CheckCircle className="w-4 h-4" />;
      case 'comment_added': return <Send className="w-4 h-4" />;
      case 'carrier_onboarded': return <MapPin className="w-4 h-4" />;
      case 'rate_updated': return <Edit className="w-4 h-4" />;
      case 'document_uploaded': return <Download className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Get color for activity type
  const getActivityColor = (type) => {
    switch(type) {
      case 'load_created': return 'bg-blue-100 text-blue-800';
      case 'driver_assigned': return 'bg-purple-100 text-purple-800';
      case 'status_updated': return 'bg-emerald-100 text-emerald-800';
      case 'comment_added': return 'bg-cyan-100 text-cyan-800';
      case 'carrier_onboarded': return 'bg-indigo-100 text-indigo-800';
      case 'rate_updated': return 'bg-amber-100 text-amber-800';
      case 'document_uploaded': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // Filter activities
  const filteredActivities = activityLog.filter(activity => {
    const matchesSearch = searchTerm === '' ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || activity.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleExportLog = () => {
    alert('Exporting audit log to CSV...');
    // In production, export actual data
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Activity & Audit Log
          </CardTitle>
          <Button onClick={handleExportLog} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Log
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Info Banner */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>📋 Complete Audit Trail:</strong> All user activity is automatically logged for compliance, 
            security, and operational review. Logs include timestamps, user details, and action specifics.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Activities</option>
            <option value="load_created">Load Created</option>
            <option value="driver_assigned">Driver Assigned</option>
            <option value="status_updated">Status Updated</option>
            <option value="comment_added">Comments</option>
            <option value="carrier_onboarded">Carrier Onboarded</option>
            <option value="rate_updated">Rate Changes</option>
            <option value="document_uploaded">Documents</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Activity Stream */}
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No activities found</p>
            </div>
          ) : (
            filteredActivities.map((activity, idx) => (
              <div 
                key={activity.id} 
                className="relative pl-8 pb-4 border-l-2 border-slate-200 last:border-l-0"
              >
                {/* Timeline dot */}
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${getActivityColor(activity.type)} border-2 border-white flex items-center justify-center`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                </div>

                {/* Activity Card */}
                <div className="ml-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getActivityColor(activity.type)}>
                        {getActivityIcon(activity.type)}
                        <span className="ml-1">{activity.type.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    {activity.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {activity.user}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {activity.entity}
                    </span>
                  </div>

                  {/* Details */}
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="mt-3 p-2 bg-white rounded border border-slate-200">
                      <p className="text-xs font-semibold text-slate-700 mb-1">Details:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(activity.details).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-slate-500">{key.replace('_', ' ')}:</span>
                            <span className="ml-1 font-semibold text-slate-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{activityLog.length}</p>
            <p className="text-sm text-slate-600">Total Activities</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {new Set(activityLog.map(a => a.user)).size}
            </p>
            <p className="text-sm text-slate-600">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {activityLog.filter(a => 
                new Date(a.timestamp).toDateString() === new Date().toDateString()
              ).length}
            </p>
            <p className="text-sm text-slate-600">Today's Activities</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}