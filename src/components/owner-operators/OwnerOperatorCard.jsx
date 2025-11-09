import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Edit, 
  Star, 
  TrendingUp, 
  DollarSign,
  Calendar,
  MapPin
} from "lucide-react";

export default function OwnerOperatorCard({ ownerOperator, onEdit }) {
  const statusColors = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-slate-100 text-slate-800',
    suspended: 'bg-red-100 text-red-800',
    pending_approval: 'bg-amber-100 text-amber-800'
  };

  return (
    <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-6">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {ownerOperator.full_name}
            </h3>
            {ownerOperator.company_name && (
              <p className="text-sm text-slate-600 mb-2">{ownerOperator.company_name}</p>
            )}
            <div className="flex items-center gap-2">
              <Badge className={statusColors[ownerOperator.status] || statusColors.pending_approval}>
                {ownerOperator.status?.replace(/_/g, ' ')}
              </Badge>
              {ownerOperator.rating && (
                <Badge className="bg-amber-100 text-amber-800">
                  <Star className="w-3 h-3 mr-1" />
                  {ownerOperator.rating.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={() => onEdit(ownerOperator)}
            size="sm"
            variant="outline"
            className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* Equipment Info */}
        {ownerOperator.equipment_owned && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-900">Equipment</span>
            </div>
            <div className="text-sm text-slate-700">
              <p><strong>Truck:</strong> {ownerOperator.equipment_owned.truck_number || 'N/A'}</p>
              <p><strong>Make/Model:</strong> {ownerOperator.equipment_owned.make_model || 'N/A'}</p>
              <p><strong>Year:</strong> {ownerOperator.equipment_owned.year || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 uppercase">Phone</p>
            <p className="text-sm font-semibold text-slate-900">{ownerOperator.phone}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Email</p>
            <p className="text-sm font-semibold text-slate-900 truncate">
              {ownerOperator.email || 'N/A'}
            </p>
          </div>
        </div>

        {/* Payment Structure */}
        <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-900">Payment Structure</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700 capitalize">
              {ownerOperator.payment_structure?.replace(/_/g, ' ')}
            </span>
            <span className="text-lg font-bold text-emerald-700">
              {ownerOperator.payment_structure === 'percentage' 
                ? `${ownerOperator.payment_rate}%`
                : ownerOperator.payment_structure === 'per_mile'
                ? `$${ownerOperator.payment_rate}/mi`
                : `$${ownerOperator.payment_rate}`
              }
            </span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <p className="text-xs text-slate-500">Loads</p>
            <p className="text-lg font-bold text-blue-600">{ownerOperator.total_loads || 0}</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <p className="text-xs text-slate-500">Miles</p>
            <p className="text-lg font-bold text-purple-600">
              {ownerOperator.total_miles?.toLocaleString() || 0}
            </p>
          </div>
          <div className="text-center p-2 bg-emerald-50 rounded-lg">
            <p className="text-xs text-slate-500">On-Time</p>
            <p className="text-lg font-bold text-emerald-600">
              {ownerOperator.on_time_percentage || 0}%
            </p>
          </div>
        </div>

        {/* Lease Info */}
        {ownerOperator.lease_agreement_date && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3 h-3 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-900">Lease Agreement</span>
            </div>
            <p className="text-xs text-slate-700">
              Started: {new Date(ownerOperator.lease_agreement_date).toLocaleDateString()}
            </p>
            {ownerOperator.lease_expiration_date && (
              <p className="text-xs text-slate-700">
                Expires: {new Date(ownerOperator.lease_expiration_date).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Home Terminal */}
        {ownerOperator.home_terminal && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>
              Home: {ownerOperator.home_terminal.city}, {ownerOperator.home_terminal.state}
            </span>
          </div>
        )}

      </CardContent>
    </Card>
  );
}