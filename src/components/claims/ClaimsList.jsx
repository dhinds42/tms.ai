import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

export default function ClaimsList({ claims, loads, carriers, shippers, onUpdateClaim, operatingMode }) {
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'denied': return <XCircle className="w-4 h-4" />;
      case 'under_review': return <Clock className="w-4 h-4" />;
      case 'submitted': return <FileText className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getClaimTypeLabel = (type) => {
    const types = {
      cargo_damage: 'Cargo Damage',
      cargo_loss: 'Cargo Loss',
      shortage: 'Shortage',
      concealed_damage: 'Concealed Damage',
      theft: 'Theft',
      delay: 'Delay',
      other: 'Other'
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-4">
      {claims.length === 0 ? (
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Claims Filed</h3>
            <p className="text-slate-600">File your first claim to get started</p>
          </CardContent>
        </Card>
      ) : (
        claims.map((claim) => {
          const load = loads.find(l => l.id === claim.load_id);
          const carrier = carriers.find(c => c.id === claim.carrier_id);
          const shipper = shippers.find(s => s.id === claim.shipper_id);

          return (
            <Card key={claim.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{claim.claim_number}</h3>
                      <Badge className={getStatusColor(claim.status)}>
                        {getStatusIcon(claim.status)}
                        <span className="ml-2">{claim.status.replace('_', ' ').toUpperCase()}</span>
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800">
                        {getClaimTypeLabel(claim.claim_type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Filed: {new Date(claim.filed_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Claim Amount</p>
                    <p className="text-3xl font-bold text-blue-600">${claim.claim_amount.toLocaleString()}</p>
                    {claim.approved_amount > 0 && (
                      <p className="text-sm text-emerald-600 font-semibold">
                        Approved: ${claim.approved_amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Load & Party Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Load Number</p>
                    <p className="font-semibold text-slate-900">{load?.load_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Shipper</p>
                    <p className="font-semibold text-slate-900">{shipper?.company_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Carrier</p>
                    <p className="font-semibold text-slate-900">{carrier?.company_name || 'N/A'}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-sm text-slate-700">{claim.description}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {claim.status === 'submitted' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 text-white"
                        onClick={() => onUpdateClaim(claim.id, { status: 'under_review' })}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const amount = parseFloat(prompt('Enter approved amount:', claim.claim_amount));
                          if (!isNaN(amount)) {
                            onUpdateClaim(claim.id, { status: 'approved', approved_amount: amount });
                          }
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300"
                        onClick={() => onUpdateClaim(claim.id, { status: 'denied' })}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Deny
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    Upload Documents
                  </Button>
                </div>

              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}