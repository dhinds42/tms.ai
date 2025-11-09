import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function BookShipmentModal({ order, onClose, onConfirmBooking }) {
  const [isBooking, setIsBooking] = useState(false);
  const [locationValidation, setLocationValidation] = useState({
    pickup: order.pickup_location?.address ? true : false,
    delivery: order.delivery_location?.address ? true : false
  });

  const [pickupLocation, setPickupLocation] = useState(order.pickup_location || {});
  const [deliveryLocation, setDeliveryLocation] = useState(order.delivery_location || {});

  const handleConfirmBooking = async () => {
    // Validate locations
    if (!pickupLocation.address || !deliveryLocation.address) {
      alert('Please complete all location details before booking');
      return;
    }

    setIsBooking(true);

    try {
      // Simulate booking with carrier
      await new Promise(resolve => setTimeout(resolve, 2000));

      const bookingData = {
        booking_reference: `USHIP-${Date.now()}`,
        tracking_url: `https://tracking.example.com/${Date.now()}`,
        auto_create_carrier: true
      };

      onConfirmBooking(bookingData);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book shipment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Book LTL Shipment</h2>
            <p className="text-slate-600 mt-1">Order {order.order_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" disabled={isBooking}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Booking Summary */}
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Booking Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Carrier</p>
                <p className="text-lg font-bold text-slate-900">{order.selected_rate?.carrier_name}</p>
                <Badge className="mt-1 bg-indigo-600">{order.selected_rate?.service_level}</Badge>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Cost</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ${order.selected_rate?.customer_rate?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Transit Time</p>
                <p className="text-lg font-bold text-slate-900">{order.selected_rate?.transit_days} business days</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Expected Margin</p>
                <p className="text-lg font-bold text-blue-600">${order.selected_rate?.margin?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Location Validation */}
          {(!locationValidation.pickup || !locationValidation.delivery) && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">Missing Location Details</h4>
                  <p className="text-sm text-amber-800 mb-4">
                    Complete location information is required for accurate booking and best rates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pickup Location Validation */}
          {!locationValidation.pickup && (
            <div className="border-2 border-emerald-200 rounded-xl p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Complete Pickup Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={pickupLocation.company_name || ''}
                    onChange={(e) => setPickupLocation({ ...pickupLocation, company_name: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Address *</Label>
                  <Input
                    value={pickupLocation.address || ''}
                    onChange={(e) => {
                      setPickupLocation({ ...pickupLocation, address: e.target.value });
                      setLocationValidation({ ...locationValidation, pickup: true });
                    }}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input
                    value={pickupLocation.city || ''}
                    onChange={(e) => setPickupLocation({ ...pickupLocation, city: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input
                    value={pickupLocation.state || ''}
                    onChange={(e) => setPickupLocation({ ...pickupLocation, state: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Delivery Location Validation */}
          {!locationValidation.delivery && (
            <div className="border-2 border-red-200 rounded-xl p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Complete Delivery Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={deliveryLocation.company_name || ''}
                    onChange={(e) => setDeliveryLocation({ ...deliveryLocation, company_name: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Address *</Label>
                  <Input
                    value={deliveryLocation.address || ''}
                    onChange={(e) => {
                      setDeliveryLocation({ ...deliveryLocation, address: e.target.value });
                      setLocationValidation({ ...locationValidation, delivery: true });
                    }}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input
                    value={deliveryLocation.city || ''}
                    onChange={(e) => setDeliveryLocation({ ...deliveryLocation, city: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input
                    value={deliveryLocation.state || ''}
                    onChange={(e) => setDeliveryLocation({ ...deliveryLocation, state: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Booking Confirmation */}
          {locationValidation.pickup && locationValidation.delivery && (
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Ready to Book</h3>
                  <p className="text-slate-600 mt-1">
                    All location details are complete. Confirm to book this shipment and create a load.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-700 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Load will be automatically created</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Carrier will be added to your network</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>BOL documents will be sent to your load</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Tracking updates will be logged automatically</span>
                </div>
              </div>

              <Button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white text-lg py-6"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Booking Shipment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm Payment and Build Load
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Terms */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <p className="font-semibold mb-2">Terms & Conditions:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>By confirming this booking, you agree to the carrier's terms and conditions</li>
              <li>Rates are guaranteed at the time of booking</li>
              <li>Cancellations may incur fees as per carrier policy</li>
              <li>Insurance coverage is included as specified in the rate quote</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}