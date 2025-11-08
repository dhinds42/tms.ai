import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, MapPin, DollarSign, Package, Edit, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-300",
  inactive: "bg-slate-100 text-slate-700 border-slate-300",
  pending: "bg-amber-100 text-amber-700 border-amber-300"
};

const paymentTermColors = {
  net_15: "bg-emerald-100 text-emerald-700",
  net_30: "bg-blue-100 text-blue-700",
  net_45: "bg-amber-100 text-amber-700",
  net_60: "bg-orange-100 text-orange-700",
  quick_pay: "bg-purple-100 text-purple-700"
};

export default function ShipperCard({ shipper, onEdit }) {
  const rating = Math.floor(shipper.rating || 0);
  
  return (
    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
      <CardContent className="p-6">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {shipper.company_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < rating ? 'bg-amber-500' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-slate-600 ml-1">
                    {shipper.rating ? shipper.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${statusColors[shipper.status]} border font-medium capitalize`}>
                {shipper.status}
              </Badge>
              {shipper.payment_terms && (
                <Badge variant="outline" className={`${paymentTermColors[shipper.payment_terms]} font-medium`}>
                  {shipper.payment_terms.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(shipper)}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4 p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700 font-medium">{shipper.contact_name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{shipper.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{shipper.email}</span>
          </div>
          {shipper.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                {shipper.address.city}, {shipper.address.state} {shipper.address.zip}
              </span>
            </div>
          )}
        </div>

        {/* Primary Lanes */}
        {shipper.primary_lanes && shipper.primary_lanes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Primary Lanes</p>
            <div className="space-y-2">
              {shipper.primary_lanes.slice(0, 3).map((lane, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                  <span className="text-slate-700">
                    {lane.origin} → {lane.destination}
                  </span>
                  <Badge variant="outline" className="bg-white text-slate-600 text-xs">
                    {lane.frequency}
                  </Badge>
                </div>
              ))}
              {shipper.primary_lanes.length > 3 && (
                <p className="text-xs text-slate-500 pl-2">
                  +{shipper.primary_lanes.length - 3} more lanes
                </p>
              )}
            </div>
          </div>
        )}

        {/* Commodities */}
        {shipper.commodities && shipper.commodities.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Commodities</p>
            <div className="flex flex-wrap gap-2">
              {shipper.commodities.map((commodity, index) => (
                <Badge key={index} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                  <Package className="w-3 h-3 mr-1" />
                  {commodity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Package className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Loads</p>
            </div>
            <p className="text-lg font-bold text-purple-600">
              {shipper.total_loads || 0}
            </p>
          </div>
          <div className="text-center border-x border-slate-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Revenue</p>
            </div>
            <p className="text-lg font-bold text-emerald-600">
              ${(shipper.total_revenue || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Avg Rate</p>
            </div>
            <p className="text-lg font-bold text-indigo-600">
              ${(shipper.average_rate || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Credit & Last Contact */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-slate-500">Credit Limit</p>
              <p className="font-medium text-slate-900">
                ${(shipper.credit_limit || 0).toLocaleString()}
              </p>
            </div>
            {shipper.last_contact_date && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Last Contact</p>
                <p className="font-medium text-slate-900">
                  {format(new Date(shipper.last_contact_date), "MMM d, yyyy")}
                </p>
              </div>
            )}
          </div>
        </div>

        {shipper.next_follow_up && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-900 mb-1">Follow-up Scheduled</p>
            <p className="text-sm text-amber-800">
              {format(new Date(shipper.next_follow_up), "MMMM d, yyyy")}
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}