import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const quotePreview = `LTL FREIGHT QUOTE
Order: ${order.order_number}
Date: ${new Date().toLocaleDateString()}

FROM: ${order.pickup_location?.city}, ${order.pickup_location?.state}
TO: ${order.delivery_location?.city}, ${order.delivery_location?.state}

CARRIER: ${order.selected_rate?.carrier_name}
SERVICE: ${order.selected_rate?.service_level}
TRANSIT: ${order.selected_rate?.transit_days} days

TOTAL: $${customerRate.toFixed(2)}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Pricing & Quote</h2>
            <p className="text-slate-600 mt-1">{order.order_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Rate Summary */}
          <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200">
            <h3 className="font-bold text-lg mb-4">Selected Rate</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Carrier</p>
                <p className="text-lg font-bold">{order.selected_rate?.carrier_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Cost</p>
                <p className="text-2xl font-bold text-blue-600">${carrierCost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Markup */}
          <div className="border-2 border-purple-200 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">Configure Markup</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Type</Label>
                <select
                  value={markupType}
                  onChange={(e) => setMarkupType(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border rounded-lg"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={markupAmount}
                  onChange={(e) => setMarkupAmount(parseFloat(e.target.value) || 0)}
                  className="mt-2"
                />
              </div>
            </div>

            <Button onClick={handleApplyMarkup} variant="outline" className="mb-4">
              Apply Markup
            </Button>

            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-slate-600">Customer</p>
                <p className="text-2xl font-bold text-emerald-600">${customerRate.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Margin</p>
                <p className="text-2xl font-bold text-blue-600">${margin.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Margin %</p>
                <p className="text-2xl font-bold text-purple-600">{marginPercent}%</p>
              </div>
            </div>
          </div>

          {/* Send Quote */}
          <div className="border-2 border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">Send Quote</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Recipients</Label>
                <Input
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="email@example.com"
                  className="mt-2"
                />
              </div>

              <Button
                onClick={() => setShowQuotePreview(!showQuotePreview)}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Preview Quote
              </Button>

              {showQuotePreview && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <pre className="text-xs whitespace-pre-wrap">{quotePreview}</pre>
                </div>
              )}

              <Button
                onClick={handleSendQuote}
                className="w-full bg-blue-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Quote
              </Button>
            </div>
          </div>

          {/* Book */}
          <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
            <h3 className="font-bold text-lg mb-2">Ready to Book?</h3>
            <p className="text-slate-600 mb-4">Skip quote and book immediately</p>
            <Button
              onClick={onBookShipment}
              className="bg-emerald-600 text-white"
            >
              <Truck className="w-4 h-4 mr-2" />
              Book Shipment
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}