import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Wrench, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  Fuel,
  FileText,
  Bell,
  TrendingUp
} from "lucide-react";
import { PageHeader } from "@/components/design-system";

export default function MaintenanceTracking() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 200),
    initialData: [],
  });

  // Mock maintenance data
  const maintenanceRecords = drivers.map(driver => ({
    driver_id: driver.id,
    driver_name: driver.full_name,
    equipment_id: `TRUCK-${Math.floor(Math.random() * 1000)}`,
    current_mileage: Math.floor(Math.random() * 200000) + 50000,
    last_oil_change: Math.floor(Math.random() * 8000),
    oil_change_interval: 10000,
    next_oil_change_due: null,
    registration_expiration: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    inspection_expiration: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    alerts: []
  })).map(record => {
    const milesUntilOilChange = record.oil_change_interval - record.last_oil_change;
    record.next_oil_change_due = record.current_mileage + milesUntilOilChange;
    
    // Generate alerts
    if (milesUntilOilChange <= 1000) {
      record.alerts.push({
        type: 'oil_change',
        severity: milesUntilOilChange <= 500 ? 'critical' : 'warning',
        message: `Oil change due in ${milesUntilOilChange} miles`
      });
    }

    const daysUntilRegistration = (new Date(record.registration_expiration) - new Date()) / (1000 * 60 * 60 * 24);
    if (daysUntilRegistration <= 30) {
      record.alerts.push({
        type: 'registration',
        severity: daysUntilRegistration <= 7 ? 'critical' : 'warning',
        message: `Registration expires in ${Math.floor(daysUntilRegistration)} days`
      });
    }

    const daysUntilInspection = (new Date(record.inspection_expiration) - new Date()) / (1000 * 60 * 60 * 24);
    if (daysUntilInspection <= 30) {
      record.alerts.push({
        type: 'inspection',
        severity: daysUntilInspection <= 7 ? 'critical' : 'warning',
        message: `Inspection expires in ${Math.floor(daysUntilInspection)} days`
      });
    }

    return record;
  });

  const stats = {
    totalVehicles: maintenanceRecords.length,
    oilChangeDue: maintenanceRecords.filter(r => r.alerts.some(a => a.type === 'oil_change')).length,
    expiringDocs: maintenanceRecords.filter(r => 
      r.alerts.some(a => a.type === 'registration' || a.type === 'inspection')
    ).length,
    criticalAlerts: maintenanceRecords.filter(r => 
      r.alerts.some(a => a.severity === 'critical')
    ).length
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Maintenance Tracking"
        subtitle={`Automated reminders and alerts • ${stats.criticalAlerts} critical alerts`}
        icon={Wrench}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Vehicles</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalVehicles}</p>
                </div>
                <Wrench className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Oil Change Due</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{stats.oilChangeDue}</p>
                </div>
                <Fuel className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Expiring Docs</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.expiringDocs}</p>
                </div>
                <FileText className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-rose-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Critical Alerts</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.criticalAlerts}</p>
                </div>
                <Bell className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-6 h-6 text-orange-600" />
              Maintenance Schedule & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>🔧 Automated Maintenance:</strong> Track equipment maintenance schedules with automated
                oil change reminders based on mileage and registration/inspection expiration alerts.
              </p>
            </div>

            {/* Maintenance Records */}
            <div className="space-y-4">
              {maintenanceRecords.map((record) => (
                <div
                  key={record.driver_id}
                  className={`p-6 rounded-lg border-2 ${
                    record.alerts.some(a => a.severity === 'critical')
                      ? 'border-red-300 bg-red-50'
                      : record.alerts.length > 0
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-emerald-300 bg-emerald-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{record.equipment_id}</h4>
                      <p className="text-sm text-slate-600">Driver: {record.driver_name}</p>
                      <Badge className="mt-2 bg-blue-100 text-blue-800">
                        {record.current_mileage.toLocaleString()} miles
                      </Badge>
                    </div>
                    {record.alerts.length > 0 ? (
                      <Badge className={`${
                        record.alerts.some(a => a.severity === 'critical')
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-amber-600 text-white'
                      }`}>
                        <Bell className="w-3 h-3 mr-1" />
                        {record.alerts.length} Alert{record.alerts.length > 1 ? 's' : ''}
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Up to Date
                      </Badge>
                    )}
                  </div>

                  {/* Alerts */}
                  {record.alerts.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {record.alerts.map((alert, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded flex items-center gap-2 ${
                            alert.severity === 'critical'
                              ? 'bg-red-100 border border-red-300'
                              : 'bg-amber-100 border border-amber-300'
                          }`}
                        >
                          <AlertCircle className={`w-4 h-4 ${
                            alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                          }`} />
                          <span className={`text-sm font-semibold ${
                            alert.severity === 'critical' ? 'text-red-900' : 'text-amber-900'
                          }`}>
                            {alert.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Maintenance Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded border border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Oil Change</p>
                      <p className="text-sm text-slate-900">
                        Last: {record.last_oil_change.toLocaleString()} mi ago
                      </p>
                      <p className="text-sm text-slate-900">
                        Next: {record.next_oil_change_due.toLocaleString()} mi
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Registration</p>
                      <p className="text-sm text-slate-900">
                        Expires: {new Date(record.registration_expiration).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        ({Math.floor((new Date(record.registration_expiration) - new Date()) / (1000 * 60 * 60 * 24))} days)
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Inspection</p>
                      <p className="text-sm text-slate-900">
                        Expires: {new Date(record.inspection_expiration).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        ({Math.floor((new Date(record.inspection_expiration) - new Date()) / (1000 * 60 * 60 * 24))} days)
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="bg-emerald-600 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mark Complete
                    </Button>
                    <Button size="sm" variant="outline">
                      Schedule Service
                    </Button>
                    <Button size="sm" variant="outline">
                      View History
                    </Button>
                  </div>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}