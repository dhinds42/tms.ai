import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function CarrierComplianceChecklist({ carriers, complianceItems, isLoading }) {
  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const getCarrierStatus = (carrier) => {
    const carrierItems = complianceItems.filter(c => c.entity_id === carrier.id);
    const expired = carrierItems.filter(c => c.status === 'expired').length;
    const expiringSoon = carrierItems.filter(c => c.status === 'expiring_soon').length;
    
    if (expired > 0) return 'critical';
    if (expiringSoon > 0) return 'warning';
    return 'compliant';
  };

  const statusConfig = {
    compliant: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-300' },
    warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-300' },
    critical: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          Carrier Compliance Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Carrier</TableHead>
                <TableHead className="font-semibold">MC/DOT</TableHead>
                <TableHead className="font-semibold">Insurance</TableHead>
                <TableHead className="font-semibold">Compliance Score</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carriers.map((carrier) => {
                const status = getCarrierStatus(carrier);
                const StatusIcon = statusConfig[status].icon;
                const insuranceValid = carrier.insurance_expiration && new Date(carrier.insurance_expiration) > new Date();

                return (
                  <TableRow key={carrier.id} className="hover:bg-slate-50">
                    <TableCell>
                      <span className="font-semibold text-slate-900">{carrier.company_name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-700">
                        <div>MC: {carrier.mc_number}</div>
                        <div>DOT: {carrier.dot_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {insuranceValid ? (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Valid until {format(new Date(carrier.insurance_expiration), "MM/dd/yy")}
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">
                          <XCircle className="w-3 h-3 mr-1" />
                          Expired/Missing
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              (carrier.compliance_score || 0) >= 90 ? 'bg-emerald-500' :
                              (carrier.compliance_score || 0) >= 70 ? 'bg-blue-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${carrier.compliance_score || 0}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-900">
                          {carrier.compliance_score || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig[status].bg} ${statusConfig[status].color} border ${statusConfig[status].border}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status === 'compliant' ? 'Compliant' : status === 'warning' ? 'Warning' : 'Critical'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {carrier.updated_date 
                          ? format(new Date(carrier.updated_date), "MMM d, yyyy")
                          : 'N/A'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}