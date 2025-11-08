import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, MapPin, DollarSign, TrendingUp, Edit, Shield } from "lucide-react";

const statusColors = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-300",
  inactive: "bg-slate-100 text-slate-700 border-slate-300",
  pending: "bg-amber-100 text-amber-700 border-amber-300"
};

const creditStatusColors = {
  approved: "bg-emerald-600",
  rejected: "bg-red-600",
  requires_review: "bg-amber-600",
  pending: "bg-slate-600"
};

export default function ShipperCard({ shipper, onEdit, operatingMode }) {
  return (
    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white">
      <CardContent className="p-6">
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {shipper.company_name}
              </h3>
              <p className="text-sm text-slate-600">{shipper.contact_name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(shipper)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className={`${statusColors[shipper.status]} border font-medium capitalize`}>
            {shipper.status}
          </Badge>
          {shipper.credit_status && (
            <Badge className={`${creditStatusColors[shipper.credit_status]} text-white text-xs`}>
              <Shield className="w-3 h-3 mr-1" />
              {shipper.credit_status === 'approved' ? 'Approved' :
               shipper.credit_status === 'rejected' ? 'Rejected' :
               shipper.credit_status === 'requires_review' ? 'Review' : 'Pending'}
            </Badge>
          )}
          {shipper.contract_status === 'signed' && (
            <Badge className="bg-blue-600 text-white text-xs">
              Contract Signed
            </Badge>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="w-4 h-4 text-purple-600" />
            <span>{shipper.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4 text-purple-600" />
            <span>{shipper.phone}</span>
          </div>
          {shipper.address && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>
                {shipper.address.city}, {shipper.address.state}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <p className="text-xs text-slate-600">Total Loads</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{shipper.total_loads || 0}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              <p className="text-xs text-slate-600">Revenue</p>
            </div>
            <p className="text-xl font-bold text-indigo-600">
              ${((shipper.total_revenue || 0) / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        {shipper.credit_score && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Credit Score</span>
              <span className="text-2xl font-bold text-blue-600">{shipper.credit_score}</span>
            </div>
          </div>
        )}

        {shipper.payment_terms && (
          <div className="mt-3 text-center">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
              Payment: {shipper.payment_terms.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        )}

      </CardContent>
    </Card>
  );
}