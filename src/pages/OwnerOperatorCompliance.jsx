import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
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
  Truck,
  TrendingUp
} from "lucide-react";
import { PageHeader, SkeletonCard } from "@/components/design-system";

export default function OwnerOperatorCompliance() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [searchTerm, setSearchTerm] = useState("");

  const { data: ownerOperators } = useQuery({
    queryKey: ['ownerOperators'],
    queryFn: () => base44.entities.OwnerOperator.list('-created_date', 100),
    initialData: [],
  });

  const { data: complianceItems } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-created_date', 200),
    initialData: [],
  });

  if (operatingMode !== 'carrier') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Carrier Mode Required</h2>
              <p className="text-red-700">Owner Operator Compliance is only available in Carrier Mode.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Map owner operators to driver compliance entity type
  const ownerOpCompliance = complianceItems.filter(c => c.entity_type === 'driver');
  
  const expiredItems = ownerOpCompliance.filter(c => c.status === 'expired');
  const expiringSoonItems = ownerOpCompliance.filter(c => c.status === 'expiring_soon');
  const currentItems = ownerOpCompliance.filter(c => c.status === 'current');

  const filteredOwnerOps = ownerOperators.filter(ownerOp => {
    const searchMatch = searchTerm === '' || 
      ownerOp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ownerOp.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ownerOp.cdl_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const getOwnerOpCompliance = (ownerOpId) => {
    return ownerOpCompliance.filter(c => c.entity_id === ownerOpId);
  };

  const getComplianceStatus = (compliance) => {
    const hasExpired = compliance.some(c => c.status === 'expired');
    const hasExpiringSoon = compliance.some(c => c.status === 'expiring_soon');
    
    if (hasExpired) return { label: 'Critical', color: 'bg-red-100 text-red-800' };
    if (hasExpiringSoon) return { label: 'Warning', color: 'bg-amber-100 text-amber-800' };
    return { label: 'Compliant', color: 'bg-emerald-100 text-emerald-800' };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Owner Operator Compliance"
        subtitle={`Monitor CDLs, medical cards, and leases • ${expiredItems.length} expired items`}
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

          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Owner Ops</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{ownerOperators.length}</p>
                </div>
                <Truck className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search owner operators by name, company, or CDL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Owner Operator Compliance Grid */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Owner Operator Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOwnerOps.map(ownerOp => {
                const compliance = getOwnerOpCompliance(ownerOp.id);
                const status = getComplianceStatus(compliance);

                return (
                  <div key={ownerOp.id} className="p-6 border border-slate-200 rounded-xl hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{ownerOp.full_name}</h3>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        {ownerOp.company_name && (
                          <p className="text-slate-600 mb-2">{ownerOp.company_name}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500">CDL Number</p>
                            <p className="font-semibold">{ownerOp.cdl_number}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">CDL Expiration</p>
                            <p className="font-semibold">
                              {ownerOp.cdl_expiration ? new Date(ownerOp.cdl_expiration).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Equipment</p>
                            <p className="font-semibold">{ownerOp.equipment_owned?.truck_number || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Status</p>
                            <Badge className={ownerOp.status === 'active' ? 'bg-emerald-600' : 'bg-amber-600'}>
                              {ownerOp.status}
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