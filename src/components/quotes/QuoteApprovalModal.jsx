import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  DollarSign,
  MapPin,
  Truck,
  Calendar,
  ArrowRight
} from "lucide-react";

export default function QuoteApprovalModal({ quote, carriers, onApprove, onReject, onClose }) {
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [autoCreateLoad, setAutoCreateLoad] = useState(true);

  // Filter carriers by equipment type
  const matchingCarriers = carriers.filter(carrier => 
    carrier.equipment_types?.includes(quote.equipment_type) &&
    carrier.status === 'active'
  );

  const handleApprove = () => {
    onApprove({
      quote,
      carrier: selectedCarrier,
      notes: approvalNotes,
      auto_create_load: autoCreateLoad
    });
  };

  const handleReject = () => {
    onReject({
      quote,
      notes: approvalNotes
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Approve Spot Quote</h2>
              <p className="text-sm text-slate-600 mt-1">
                {quote.quote_number} - Review and assign to carrier
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Quote Details */}
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Route Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-600">Pickup</p>
                        <p className="text-sm text-slate-900">
                          {quote.pickup_location?.city}, {quote.pickup_location?.state}
                        </p>
                        {quote.pickup_date && (
                          <p className="text-xs text-slate-600 mt-1">
                            {new Date(quote.pickup_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-600">Delivery</p>
                        <p className="text-sm text-slate-900">
                          {quote.dropoff_location?.city}, {quote.dropoff_location?.state}
                        </p>
                        {quote.delivery_date && (
                          <p className="text-xs text-slate-600 mt-1">
                            {new Date(quote.delivery_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Load Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-600">Mode</p>
                      <p className="font-semibold text-slate-900">{quote.mode}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Equipment</p>
                      <p className="font-semibold text-slate-900">{quote.equipment_type?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Commodity</p>
                      <p className="font-semibold text-slate-900">{quote.commodity || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Weight</p>
                      <p className="font-semibold text-slate-900">{quote.weight || 'N/A'} lbs</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded border border-indigo-200">
                    <p className="text-xs text-slate-600">Quoted Rate</p>
                    <p className="text-3xl font-bold text-indigo-600">${quote.quoted_rate?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carrier Selection */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">Assign to Carrier</h3>
            <p className="text-sm text-slate-600 mb-4">
              {matchingCarriers.length} carriers available with {quote.equipment_type?.replace('_', ' ')} equipment
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
              {matchingCarriers.map(carrier => (
                <button
                  key={carrier.id}
                  onClick={() => setSelectedCarrier(carrier)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedCarrier?.id === carrier.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{carrier.company_name}</h4>
                      <p className="text-xs text-slate-600">MC: {carrier.mc_number}</p>
                    </div>
                    {selectedCarrier?.id === carrier.id && (
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Badge className="bg-emerald-100 text-emerald-800">
                      {carrier.rating || 4.5}★
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      {carrier.on_time_percentage || 95}% OTP
                    </Badge>
                  </div>
                </button>
              ))}
            </div>

            {matchingCarriers.length === 0 && (
              <div className="text-center py-8 bg-slate-50 rounded-lg">
                <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No matching carriers available</p>
              </div>
            )}
          </div>

          {/* Auto-Create Load Option */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCreateLoad}
                onChange={(e) => setAutoCreateLoad(e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="font-semibold text-blue-900">Auto-Create Load & Assign Carrier</p>
                <p className="text-sm text-blue-800 mt-1">
                  Automatically create a load in the Load Planner and assign the selected carrier when quote is approved
                </p>
              </div>
            </label>
          </div>

          {/* Approval Notes */}
          <div>
            <Label>Approval Notes (Optional)</Label>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add any notes about this approval..."
              className="w-full mt-2 px-3 py-2 border rounded-lg h-20"
            />
          </div>

          {/* Approval Summary */}
          {selectedCarrier && autoCreateLoad && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h4 className="font-bold text-emerald-900 mb-3">Approval Summary:</h4>
              <div className="space-y-2 text-sm text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Quote will be marked as <strong>Accepted</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Load will be created in <strong>Load Planner</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Carrier <strong>{selectedCarrier.company_name}</strong> will be assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Status will be set to <strong>Tendered</strong></span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-200 flex gap-3">
          <Button
            onClick={handleApprove}
            disabled={!selectedCarrier}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve & {autoCreateLoad ? 'Create Load' : 'Accept Quote'}
          </Button>
          <Button
            onClick={handleReject}
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Quote
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        </div>

      </div>
    </div>
  );
}