import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Info, Truck } from "lucide-react";

export default function GetRatesModal({ order, onClose, onSelectRate }) {
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRate, setExpandedRate] = useState(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setIsLoading(true);
    
    try {
      // Simulate fetching rates from uShip or other LTL carriers
      // In production, this would call actual carrier APIs
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an LTL carrier rate quotation system.

ORDER DETAILS:
- Pickup: ${order.pickup_location?.city}, ${order.pickup_location?.state} ${order.pickup_location?.zip}
- Delivery: ${order.delivery_location?.city}, ${order.delivery_location?.state} ${order.delivery_location?.zip}
- Commodity: ${order.commodity}
- Total Weight: ${order.items?.reduce((sum, item) => sum + item.weight, 0)} lbs
- Total Items: ${order.items?.length}
- Location Classes: Pickup ${order.pickup_location?.location_class}, Delivery ${order.delivery_location?.location_class}

Generate 4-6 competitive LTL carrier rate quotes with realistic pricing. Include:
- Major carriers (FedEx Freight, Old Dominion, XPO, Estes, R+L Carriers, etc.)
- Different service levels (Standard, Expedited, Guaranteed)
- Transit times (2-7 business days based on distance)
- Base rates, fuel surcharge, accessorial charges
- Special services pricing (residential delivery, liftgate, inside delivery, etc.)

Provide realistic market rates for LTL shipping in current market conditions.`,
        response_json_schema: {
          type: "object",
          properties: {
            rates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  carrier_name: { type: "string" },
                  carrier_logo: { type: "string" },
                  service_level: { type: "string" },
                  transit_days: { type: "number" },
                  base_rate: { type: "number" },
                  fuel_surcharge: { type: "number" },
                  accessorials: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        cost: { type: "number" },
                        description: { type: "string" }
                      }
                    }
                  },
                  total_cost: { type: "number" },
                  estimated_delivery_date: { type: "string" },
                  features: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      setRates(result.rates || []);
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      alert('Failed to fetch carrier rates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRate = (rate) => {
    onSelectRate({
      carrier_name: rate.carrier_name,
      service_level: rate.service_level,
      transit_days: rate.transit_days,
      carrier_cost: rate.total_cost,
      markup_type: 'percentage',
      markup_amount: 0,
      customer_rate: rate.total_cost,
      margin: 0
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">LTL Carrier Rates</h2>
            <p className="text-slate-600 mt-1">
              {order.pickup_location?.city}, {order.pickup_location?.state} → {order.delivery_location?.city}, {order.delivery_location?.state}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Fetching rates from carriers...</p>
              <p className="text-sm text-slate-500 mt-2">This may take a few moments</p>
            </div>
          ) : rates.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No rates available for this route</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rates.map((rate, index) => (
                <div
                  key={index}
                  className="border-2 border-slate-200 rounded-xl p-6 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{rate.carrier_name}</h3>
                      <p className="text-slate-600">{rate.service_level}</p>
                      <Badge className="mt-2 bg-blue-100 text-blue-800">
                        {rate.transit_days} Business Days
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-emerald-600">
                        ${rate.total_cost.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-500">Total Cost</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Base Rate</p>
                      <p className="font-semibold text-slate-900">${rate.base_rate.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Fuel Surcharge</p>
                      <p className="font-semibold text-slate-900">${rate.fuel_surcharge.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Est. Delivery</p>
                      <p className="font-semibold text-slate-900">
                        {rate.estimated_delivery_date ? new Date(rate.estimated_delivery_date).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  </div>

                  {/* Accessorials */}
                  {rate.accessorials && rate.accessorials.length > 0 && (
                    <div className="mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedRate(expandedRate === index ? null : index)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Info className="w-4 h-4 mr-2" />
                        {expandedRate === index ? 'Hide' : 'Show'} Special Services & Fees
                      </Button>

                      {expandedRate === index && (
                        <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-slate-900 mb-3">Accessorial Charges:</h4>
                          <div className="space-y-2">
                            {rate.accessorials.map((acc, accIndex) => (
                              <div key={accIndex} className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-slate-900">{acc.name}</p>
                                  {acc.description && (
                                    <p className="text-sm text-slate-600">{acc.description}</p>
                                  )}
                                </div>
                                <p className="font-semibold text-slate-900 ml-4">${acc.cost.toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Features */}
                  {rate.features && rate.features.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-slate-700 mb-2">Included Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {rate.features.map((feature, fIndex) => (
                          <Badge key={fIndex} variant="outline" className="bg-white">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleSelectRate(rate)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  >
                    Select This Rate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Rate Information:</p>
              <p>Rates are provided by our partner carriers and include all applicable fees. Select a rate to proceed with quoting and booking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}