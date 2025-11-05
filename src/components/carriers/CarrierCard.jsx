import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, Shield, TrendingUp, Truck, Edit, Award, Calendar } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-300",
  inactive: "bg-slate-100 text-slate-700 border-slate-300",
  suspended: "bg-red-100 text-red-700 border-red-300",
  pending_approval: "bg-amber-100 text-amber-700 border-amber-300"
};

const ratingColors = {
  5: "bg-emerald-600",
  4: "bg-blue-600",
  3: "bg-amber-600",
  2: "bg-orange-600",
  1: "bg-red-600"
};

export default function CarrierCard({ carrier, onEdit }) {
  const rating = Math.floor(carrier.rating || 0);
  
  return (
    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      <CardContent className="p-6">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {carrier.company_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < rating ? ratingColors[rating] : 'bg-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-slate-600 ml-1">
                    {carrier.rating ? carrier.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className={`${statusColors[carrier.status]} border font-medium capitalize`}>
              {carrier.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(carrier)}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* MC/DOT Info */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MC Number</p>
            <p className="font-bold text-slate-900">{carrier.mc_number}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">DOT Number</p>
            <p className="font-bold text-slate-900">{carrier.dot_number}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700">{carrier.contact_name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{carrier.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{carrier.email}</span>
          </div>
        </div>

        {/* Equipment */}
        {carrier.equipment_types && carrier.equipment_types.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Equipment</p>
            <div className="flex flex-wrap gap-2">
              {carrier.equipment_types.map((equipment, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 capitalize">
                  <Truck className="w-3 h-3 mr-1" />
                  {equipment.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-semibold text-slate-500 uppercase">On-Time</p>
            </div>
            <p className="text-lg font-bold text-emerald-600">
              {carrier.on_time_percentage || 0}%
            </p>
          </div>
          <div className="text-center border-x border-slate-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="w-4 h-4 text-indigo-600" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Compliance</p>
            </div>
            <p className="text-lg font-bold text-indigo-600">
              {carrier.compliance_score || 0}%
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Loads</p>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {carrier.total_loads || 0}
            </p>
          </div>
        </div>

        {/* Safety Rating & Insurance */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-slate-500">FMCSA Rating</p>
              <p className="font-medium text-slate-900 capitalize">
                {carrier.fmcsa_safety_rating?.replace(/_/g, ' ') || 'Not Rated'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Insurance Expires</p>
              <p className="font-medium text-slate-900">
                {carrier.insurance_expiration 
                  ? format(new Date(carrier.insurance_expiration), "MMM d, yyyy")
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}