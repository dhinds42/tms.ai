import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MapPin, DollarSign, Truck, User, FileText } from "lucide-react";

export default function CollapsibleLoadPanel({ load, drivers = [], carriers = [] }) {
  const [expanded, setExpanded] = useState({
    details: true,
    carrier: false,
    billing: false
  });

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const assignedDriver = drivers.find(d => d.id === load.driver_id);
  const assignedCarrier = carriers.find(c => c.id === load.carrier_id);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            Load {load.load_number || load.id.slice(0, 8)}
          </CardTitle>
          <Badge className={
            load.status === 'delivered' ? 'bg-emerald-600' :
            load.status === 'in_transit' ? 'bg-blue-600' :
            load.status === 'assigned' ? 'bg-purple-600' :
            'bg-amber-600'
          }>
            {load.status?.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        
        {/* Load Details */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('details')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-sm text-slate-900">Load Details</span>
            </div>
            {expanded.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded.details && (
            <div className="p-3 pt-0 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-slate-600">Pickup</p>
                  <p className="font-medium text-slate-900">
                    {load.pickup_location?.city}, {load.pickup_location?.state}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Delivery</p>
                  <p className="font-medium text-slate-900">
                    {load.dropoff_location?.city}, {load.dropoff_location?.state}
                  </p>
                </div>
              </div>
              {load.equipment_type && (
                <div>
                  <p className="text-xs text-slate-600">Equipment</p>
                  <p className="font-medium text-slate-900">{load.equipment_type.replace(/_/g, ' ')}</p>
                </div>
              )}
              {load.commodity && (
                <div>
                  <p className="text-xs text-slate-600">Commodity</p>
                  <p className="font-medium text-slate-900">{load.commodity}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Carrier Info */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('carrier')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-sm text-slate-900">Carrier Info</span>
            </div>
            {expanded.carrier ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded.carrier && (
            <div className="p-3 pt-0 space-y-2 text-sm">
              {assignedDriver ? (
                <div>
                  <p className="text-xs text-slate-600">Assigned Driver</p>
                  <p className="font-medium text-slate-900">{assignedDriver.first_name} {assignedDriver.last_name}</p>
                  <p className="text-xs text-slate-600">{assignedDriver.phone}</p>
                </div>
              ) : assignedCarrier ? (
                <div>
                  <p className="text-xs text-slate-600">Assigned Carrier</p>
                  <p className="font-medium text-slate-900">{assignedCarrier.company_name}</p>
                  <p className="text-xs text-slate-600">{assignedCarrier.contact_phone}</p>
                </div>
              ) : (
                <p className="text-slate-500 italic">Not assigned</p>
              )}
              {load.carrier_pay && (
                <div>
                  <p className="text-xs text-slate-600">Carrier Pay</p>
                  <p className="font-medium text-emerald-600">${load.carrier_pay.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Billing */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('billing')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-sm text-slate-900">Billing</span>
            </div>
            {expanded.billing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded.billing && (
            <div className="p-3 pt-0 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-slate-600">Revenue</p>
                  <p className="font-medium text-emerald-600">
                    ${(load.total_revenue || load.customer_rate || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Cost</p>
                  <p className="font-medium text-red-600">
                    ${(load.carrier_pay || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              {load.margin && (
                <div>
                  <p className="text-xs text-slate-600">Margin</p>
                  <p className="font-medium text-blue-600">${load.margin.toLocaleString()}</p>
                </div>
              )}
              {load.invoice_status && (
                <div>
                  <p className="text-xs text-slate-600">Invoice Status</p>
                  <Badge className={
                    load.invoice_status === 'paid' ? 'bg-emerald-600' :
                    load.invoice_status === 'sent' ? 'bg-blue-600' :
                    'bg-amber-600'
                  }>
                    {load.invoice_status.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}