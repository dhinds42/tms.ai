import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Clock, Upload } from "lucide-react";

export default function TMSBCompliance() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: driver } = useQuery({
    queryKey: ['currentDriver', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const drivers = await base44.entities.Driver.filter({ linked_user_id: user.id });
      return drivers[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: complianceItems } = useQuery({
    queryKey: ['driverCompliance', driver?.id],
    queryFn: async () => {
      if (!driver?.id) return [];
      return await base44.entities.ComplianceItem.filter({ 
        entity_type: 'driver',
        entity_id: driver.id,
        synced_to_tms_b: true
      }, '-created_date', 50);
    },
    enabled: !!driver?.id,
    initialData: [],
  });

  const currentItems = complianceItems.filter(item => item.status === 'current');
  const expiringItems = complianceItems.filter(item => item.status === 'expiring_soon');
  const expiredItems = complianceItems.filter(item => item.status === 'expired');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'current':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'expiring_soon':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Shield className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      current: 'bg-emerald-600',
      expiring_soon: 'bg-amber-600',
      expired: 'bg-red-600',
      missing: 'bg-slate-600'
    };
    return colors[status] || 'bg-slate-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Compliance</h1>
              <p className="text-emerald-100 mt-2">Driver Compliance Portal</p>
              {driver && <p className="text-sm mt-1">{driver.first_name} {driver.last_name} - CDL: {driver.cdl_number}</p>}
            </div>
            <Shield className="w-16 h-16 opacity-30" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Current</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{currentItems.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Expiring Soon</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{expiringItems.length}</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Expired</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{expiredItems.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Compliance Score</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {Math.round((currentItems.length / (complianceItems.length || 1)) * 100)}%
                  </p>
                </div>
                <Shield className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {expiredItems.length > 0 && (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-2">Action Required: Expired Documents</h3>
                  <p className="text-sm text-red-800 mb-3">
                    You have {expiredItems.length} expired compliance item(s). Please update immediately to maintain your active status.
                  </p>
                  <Button className="bg-red-600">Upload Documents Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Compliance Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceItems.map(item => (
                <Card key={item.id} className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-900 capitalize">
                              {item.compliance_type?.replace(/_/g, ' ')}
                            </p>
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </div>
                          {item.expiration_date && (
                            <p className="text-sm text-slate-600">
                              Expires: {new Date(item.expiration_date).toLocaleDateString()}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-slate-500 mt-1">{item.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {item.document_url ? (
                          <Button variant="outline" size="sm">View</Button>
                        ) : (
                          <Button size="sm" className="bg-blue-600">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {complianceItems.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No compliance items found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}