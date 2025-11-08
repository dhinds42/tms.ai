import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Phone, Mail, MapPin, Calendar, TrendingUp, DollarSign, Edit } from "lucide-react";

export default function ShipperCRM({ shippers, loads, isLoading, operatingMode }) {
  const [selectedShipper, setSelectedShipper] = useState(null);

  if (isLoading) {
    return <div className="text-center py-12">Loading CRM data...</div>;
  }

  const getShipperLoads = (shipperId) => {
    return loads?.filter(l => l.shipper_id === shipperId) || [];
  };

  const getShipperRevenue = (shipperId) => {
    const shipperLoads = getShipperLoads(shipperId);
    return shipperLoads.reduce((sum, l) => sum + (l.customer_rate || 0), 0);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Shipper List */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg">Shipper Directory</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 max-h-[600px] overflow-y-auto">
            <div className="space-y-2">
              {shippers.map((shipper) => (
                <div
                  key={shipper.id}
                  onClick={() => setSelectedShipper(shipper)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedShipper?.id === shipper.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{shipper.company_name}</h4>
                    <Badge className={
                      shipper.status === 'active' ? 'bg-emerald-600' :
                      shipper.status === 'pending' ? 'bg-amber-600' : 'bg-slate-600'
                    }>
                      {shipper.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{shipper.contact_name}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span>{getShipperLoads(shipper.id).length} loads</span>
                    <span>•</span>
                    <span>${getShipperRevenue(shipper.id).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipper Details */}
      <div className="lg:col-span-2">
        {selectedShipper ? (
          <div className="space-y-6">
            {/* Header */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {selectedShipper.company_name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        selectedShipper.status === 'active' ? 'bg-emerald-600' :
                        selectedShipper.status === 'pending' ? 'bg-amber-600' : 'bg-slate-600'
                      }>
                        {selectedShipper.status}
                      </Badge>
                      {selectedShipper.contract_status && (
                        <Badge variant="outline" className="border-indigo-300 text-indigo-700">
                          Contract: {selectedShipper.contract_status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button className="bg-indigo-600">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    <span>{selectedShipper.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>{selectedShipper.email}</span>
                  </div>
                  {selectedShipper.address && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <span>
                        {selectedShipper.address.city}, {selectedShipper.address.state}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-700">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>Contact: {selectedShipper.contact_name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600 mb-1">Total Loads</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {getShipperLoads(selectedShipper.id).length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${getShipperRevenue(selectedShipper.id).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600 mb-1">Credit Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedShipper.credit_score || 'N/A'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600 mb-1">Rating</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {selectedShipper.rating || 'N/A'}/5
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Business Details */}
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Industry</p>
                    <p className="text-slate-900">{selectedShipper.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Company Size</p>
                    <p className="text-slate-900 capitalize">{selectedShipper.company_size || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Payment Terms</p>
                    <p className="text-slate-900">{selectedShipper.payment_terms?.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Credit Limit</p>
                    <p className="text-slate-900">${selectedShipper.credit_limit?.toLocaleString() || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Annual Volume</p>
                    <p className="text-slate-900">${selectedShipper.annual_volume?.toLocaleString() || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">DUNS Number</p>
                    <p className="text-slate-900">{selectedShipper.duns_number || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Primary Lanes */}
            {selectedShipper.primary_lanes && selectedShipper.primary_lanes.length > 0 && (
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle>Primary Shipping Lanes</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {selectedShipper.primary_lanes.map((lane, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            <div>
                              <p className="font-semibold text-slate-900">
                                {lane.origin} → {lane.destination}
                              </p>
                              <p className="text-sm text-slate-600">{lane.frequency}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Timeline */}
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {selectedShipper.last_contact_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Last Contact</p>
                        <p className="text-sm text-slate-600">
                          {new Date(selectedShipper.last_contact_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedShipper.next_follow_up && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Next Follow-up</p>
                        <p className="text-sm text-slate-600">
                          {new Date(selectedShipper.next_follow_up).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedShipper.contract_signed_date && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Contract Signed</p>
                        <p className="text-sm text-slate-600">
                          {new Date(selectedShipper.contract_signed_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {selectedShipper.notes && (
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-slate-700">{selectedShipper.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Select a shipper to view detailed CRM information</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}