import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  FileText,
  Calendar,
  TrendingUp
} from "lucide-react";
import { PageHeader, SkeletonCard } from "@/components/design-system";

export default function DriverCompliance() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [searchTerm, setSearchTerm] = useState("");

  const { data: drivers } = useScopedEntity('Driver', { limit: 100 });
  const { data: complianceItems } = useScopedEntity('ComplianceItem', { limit: 200 });

  if (operatingMode !== 'carrier') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Carrier Mode Required</h2>
              <p className="text-red-700">Driver Compliance is only available in Carrier Mode.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const driverCompliance = complianceItems.filter(c => c.entity_type === 'driver');
  
  const expiredItems = driverCompliance.filter(c => c.status === 'expired');
  const expiringSoonItems = driverCompliance.filter(c => c.status === 'expiring_soon');
  const currentItems = driverCompliance.filter(c => c.status === 'current');

  const filteredDrivers = drivers.filter(driver => {
    const searchMatch = searchTerm === '' || 
      driver.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.cdl_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const getDriverCompliance = (driverId) => {
    return driverCompliance.filter(c => c.entity_id === driverId);
  };

  const getComplianceStatus = (driverCompliance) => {
    const hasExpired = driverCompliance.some(c => c.status === 'expired');
    const hasExpiringSoon = driverCompliance.some(c => c.status === 'expiring_soon');
    
    if (hasExpired) return { label: 'Critical', color: 'bg-red-100 text-red-800' };
    if (hasExpiringSoon) return { label: 'Warning', color: 'bg-amber-100 text-amber-800' };
    return { label: 'Compliant', color: 'bg-emerald-100 text-emerald-800' };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Driver Compliance"
        subtitle={`Monitor CDLs, medical cards, and more • ${expiredItems.length} expired items`}
        icon={Shield}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Expired</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{expiredItems.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Expiring Soon</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{expiringSoonItems.length}</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Current</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{currentItems.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Drivers</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{drivers.length}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search drivers by name or CDL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Driver Compliance Grid */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Driver Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDrivers.map(driver => {
                const compliance = getDriverCompliance(driver.id);
                const status = getComplianceStatus(compliance);

                return (
                  <div key={driver.id} className="p-6 border border-slate-200 rounded-xl hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{driver.full_name}</h3>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500">CDL Number</p>
                            <p className="font-semibold">{driver.cdl_number}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">CDL Expiration</p>
                            <p className="font-semibold">
                              {driver.cdl_expiration ? new Date(driver.cdl_expiration).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Medical Card</p>
                            <p className="font-semibold">
                              {driver.medical_card_expiration ? new Date(driver.medical_card_expiration).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Status</p>
                            <Badge className={driver.status === 'available' ? 'bg-emerald-600' : 'bg-amber-600'}>
                              {driver.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compliance Items */}
                    {compliance.length > 0 && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Compliance Items ({compliance.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {compliance.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded">
                              <div className="flex items-center gap-2">
                                {item.status === 'expired' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                                {item.status === 'expiring_soon' && <Clock className="w-4 h-4 text-amber-600" />}
                                {item.status === 'current' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                                <span className="text-sm font-medium">{item.compliance_type}</span>
                              </div>
                              <Badge className={
                                item.status === 'expired' ? 'bg-red-100 text-red-800' :
                                item.status === 'expiring_soon' ? 'bg-amber-100 text-amber-800' :
                                'bg-emerald-100 text-emerald-800'
                              }>
                                {item.status === 'expired' ? 'Expired' :
                                 item.status === 'expiring_soon' ? 'Expiring Soon' :
                                 'Current'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}