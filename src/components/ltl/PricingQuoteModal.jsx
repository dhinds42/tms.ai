import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Mail, Send, Truck } from "lucide-react";

export default function PricingQuoteModal({
  order,
  onClose,
  onSendQuote,
  onBookShipment,
  onUpdateMarkup
}) {
  const [markupType, setMarkupType] = useState(order.selected_rate?.markup_type || 'percentage');
  const [markupAmount, setMarkupAmount] = useState(order.selected_rate?.markup_amount || 0);
  const [recipients, setRecipients] = useState('');
  const [includeMe, setIncludeMe] = useState(false);
  const [showQuotePreview, setShowQuotePreview] = useState(false);

  const carrierCost = order.selected_rate?.carrier_cost || 0;
  
  const calculateCustomerRate = () => {
    if (markupType === 'percentage') {
      return carrierCost * (1 + markupAmount / 100);
    } else {
      return carrierCost + markupAmount;
    }
  };

  const customerRate = calculateCustomerRate();
  const margin = customerRate - carrierCost;
  const marginPercent = carrierCost > 0 ? ((margin / carrierCost) * 100).toFixed(2) : 0;

  const handleApplyMarkup = () => {
    onUpdateMarkup({
      markup_type: markupType,
      markup_amount: parseFloat(markupAmount),
      customer_rate: customerRate,
      margin: margin
    });
  };

  const handleSendQuote = () => {
    const recipientList = recipients.split(',').map(r => r.trim()).filter(r => r);
    if (recipientList.length === 0) {
      alert('Please enter at least one recipient');
      return;
    }
    onSendQuote(recipientList);
  };

  const quotePreview = `
LTL FREIGHT QUOTE

Order Number: ${order.order_number}
Quote Date: ${new Date().toLocaleDateString()}

ROUTE INFORMATION:
Pickup: ${order.pickup_location?.company_name}
        ${order.pickup_location?.address}
        ${order.pickup_location?.city}, ${order.pickup_location?.state} ${order.pickup_location?.zip}
        
Delivery: ${order.delivery_location?.company_name}
          ${order.delivery_location?.address}
          ${order.delivery_location?.city}, ${order.delivery_location?.state} ${order.delivery_location?.zip}

SHIPMENT DETAILS:
Commodity: ${order.commodity}
Items: ${order.items?.length}
Total Weight: ${order.items?.reduce((sum, item) => sum + item.weight, 0)} lbs

CARRIER INFORMATION:
Carrier: ${order.selected_rate?.carrier_name}
Service Level: ${order.selected_rate?.service_level}
Transit Time: ${order.selected_rate?.transit_days} business days

PRICING:
Freight Charges: $${customerRate.toFixed(2)}

TOTAL QUOTE: $${customerRate.toFixed(2)}

This quote is valid for 7 days from the date above.

Thank you for your business!
`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Pricing & Quote Generation</h2>
            <p className="text-slate-600 mt-1">Order {order.order_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Selected Rate Summary */}
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Selected Rate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Carrier</p>
                <p className="text-lg font-bold text-slate-900">{order.selected_rate?.carrier_name}</p>
                <p className="text-sm text-slate-600">{order.selected_rate?.service_level}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Transit Time</p>
                <p className="text-lg font-bold text-slate-900">{order.selected_rate?.transit_days} business days</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Carrier Cost</p>
                <p className="text-2xl font-bold text-blue-600">${carrierCost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Markup Configuration */}
          <div className="border-2 border-purple-200 rounded-xl p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Configure Markup</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Markup Type</Label>
                <select
                  value={markupType}
                  onChange={(e) => setMarkupType(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <Label>Markup Amount</Label>
                <Input
                  type="number"
                  value={markupAmount}
                  onChange={(e) => setMarkupAmount(parseFloat(e.target.value) || 0)}
                  placeholder={markupType === 'percentage' ? 'e.g., 15' : 'e.g., 150'}
                  className="mt-2"
                />
              </div>
            </div>

            <Button
              onClick={handleApplyMarkup}
              variant="outline"
              className="mb-4"
            >
              Apply Markup
            </Button>

            {/* Pricing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Customer Rate</p>
                <p className="text-2xl font-bold text-emerald-600">${customerRate.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Margin</p>
                <p className="text-2xl font-bold text-blue-600">${margin.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Margin %</p>
                <p className="text-2xl font-bold text-purple-600">{marginPercent}%</p>
              </div>
            </div>
          </div>

          {/* Send Quote Section */}
          <div className="border-2 border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Send Quote to Customer</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Recipient Email(s)</Label>
                <Input
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="customer@example.com, manager@example.com"
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">Separate multiple emails with commas</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeMe}
                  onChange={(e) => setIncludeMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <Label>Send a copy to myself</Label>
              </div>

              <Button
                onClick={() => setShowQuotePreview(!showQuotePreview)}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {showQuotePreview ? 'Hide' : 'Preview'} Quote
              </Button>

              {showQuotePreview && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                    {quotePreview}
                  </pre>
                </div>
              )}

              <Button
                onClick={handleSendQuote}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Quote
              </Button>
            </div>
          </div>

          {/* Book Shipment Option */}
          <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
            <h3 className="font-bold text-lg text-slate-900 mb-2">Ready to Book?</h3>
            <p className="text-slate-600 mb-4">
              Skip the quote process and book this shipment immediately with the selected carrier.
            </p>
            <Button
              onClick={onBookShipment}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
            >
              <Truck className="w-4 h-4 mr-2" />
              Book LTL Shipment and Build Load
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}